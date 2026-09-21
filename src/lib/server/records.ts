import { RECORD_MENUS, type MenuKey } from '@/lib/menus'
import {
  incidentReference,
  calculatedRiskLevel,
  staffCompletion
} from '@/lib/records'
import type { CreateKind } from '@/lib/schemas'
import { prisma } from '@/lib/server/db'
import { writeChangeAudit } from '@/lib/server/audit'
import {
  mapAsset,
  mapAudit,
  mapCompliance,
  mapDocument,
  mapEnquiry,
  mapIncident,
  mapMaintenance,
  mapMedication,
  mapNotification,
  mapResident,
  mapRisk,
  mapRota,
  mapStaff,
  mapTraining
} from '@/lib/server/mappers'
import type { SessionPayload } from '@/lib/server/session'
import type { HavenData } from '@/lib/types'
import {
  assetSchema,
  auditSchema,
  complianceSchema,
  documentSchema,
  enquirySchema,
  incidentSchema,
  maintenanceSchema,
  medicationSchema,
  residentSchema,
  riskSchema,
  rotaSchema,
  staffSchema,
  trainingSchema
} from '@/lib/schemas'

function id() {
  return crypto.randomUUID()
}

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

async function lookupResidentId(campusId: string, name: string) {
  const row = await prisma.resident.findFirst({
    where: { campusId, deletedAt: null, fullName: name },
    select: { id: true }
  })
  return row?.id ?? null
}

async function lookupStaffId(campusId: string, name: string) {
  const row = await prisma.staffMember.findFirst({
    where: { campusId, deletedAt: null, fullName: name },
    select: { id: true }
  })
  return row?.id ?? null
}

async function lookupAssetId(campusId: string, name: string) {
  const row = await prisma.asset.findFirst({
    where: { campusId, deletedAt: null, name },
    select: { id: true }
  })
  return row?.id ?? null
}

export async function loadHavenData(session: SessionPayload): Promise<HavenData> {
  const campusId = session.campusId
  if (!campusId) {
    return {
      complianceChecks: [],
      residents: [],
      staff: [],
      audits: [],
      incidents: [],
      assets: [],
      notifications: [],
      medications: [],
      rotaShifts: [],
      trainings: [],
      maintenanceTasks: [],
      risks: [],
      documents: [],
      enquiries: []
    }
  }

  const [
    residents,
    staff,
    assets,
    checks,
    audits,
    incidents,
    notifications,
    medications,
    rota,
    trainings,
    assignments,
    maintenance,
    risks,
    documents,
    enquiries,
    carePlans
  ] = await Promise.all([
    prisma.resident.findMany({ where: { campusId, deletedAt: null }, orderBy: { createdAt: 'desc' } }),
    prisma.staffMember.findMany({ where: { campusId, deletedAt: null }, orderBy: { createdAt: 'desc' } }),
    prisma.asset.findMany({ where: { campusId, deletedAt: null }, orderBy: { createdAt: 'desc' } }),
    prisma.complianceCheck.findMany({ where: { campusId, deletedAt: null }, orderBy: { dueDate: 'asc' } }),
    prisma.audit.findMany({ where: { campusId, deletedAt: null }, orderBy: { auditDate: 'desc' } }),
    prisma.incident.findMany({ where: { campusId, deletedAt: null }, orderBy: { incidentDate: 'desc' } }),
    prisma.notification.findMany({ where: { userId: session.sub }, orderBy: { createdAt: 'desc' } }),
    prisma.medication.findMany({ where: { campusId, deletedAt: null }, orderBy: { createdAt: 'desc' } }),
    prisma.rotaShift.findMany({ where: { campusId, deletedAt: null }, orderBy: { shiftDate: 'desc' } }),
    prisma.training.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
    prisma.trainingAssignment.findMany({ where: { campusId, deletedAt: null } }),
    prisma.maintenance.findMany({ where: { campusId, deletedAt: null }, orderBy: { nextDue: 'asc' } }),
    prisma.risk.findMany({ where: { campusId, deletedAt: null }, orderBy: { createdAt: 'desc' } }),
    prisma.document.findMany({ where: { campusId, deletedAt: null }, orderBy: { createdAt: 'desc' } }),
    prisma.enquiry.findMany({ where: { campusId, deletedAt: null }, orderBy: { createdAt: 'desc' } }),
    prisma.carePlanEntry.findMany({ where: { campusId, deletedAt: null }, orderBy: { createdAt: 'desc' } })
  ])

  const residentName = new Map(residents.map(row => [row.id, row.fullName]))
  const staffName = new Map(staff.map(row => [row.id, row.fullName]))
  const staffById = new Map(staff.map(row => [row.id, row]))
  const assetName = new Map(assets.map(row => [row.id, row.name]))
  const carePlansByResident = new Map<string, Array<{ status: string; reviewDate: Date | null }>>()
  for (const entry of carePlans) {
    const list = carePlansByResident.get(entry.residentId) ?? []
    list.push({ status: entry.status, reviewDate: entry.reviewDate })
    carePlansByResident.set(entry.residentId, list)
  }

  return {
    residents: residents.map(row => mapResident({ ...row, carePlanEntries: carePlansByResident.get(row.id) })),
    staff: staff.map(mapStaff),
    assets: assets.map(mapAsset),
    complianceChecks: checks.map(row =>
      mapCompliance({
        ...row,
        assignedTo: staffName.get(row.assignedTo || '') || row.notes || 'Owner'
      })
    ),
    audits: audits.map(mapAudit),
    incidents: incidents.map(row =>
      mapIncident({
        ...row,
        title: residentName.get(row.residentId || '') || row.title
      })
    ),
    notifications: notifications.map(mapNotification),
    medications: medications.map(row => mapMedication(row, residentName.get(row.residentId) || 'Resident')),
    rotaShifts: rota.map(row => mapRota(row, staffName.get(row.staffId) || 'Staff')),
    trainings: trainings.map(row => {
      const assignment = assignments.find(item => item.trainingId === row.id)
      const owner = assignment ? staffName.get(assignment.staffId) || 'Owner' : 'Owner'
      return mapTraining(row, owner, assignment?.dueDate ? assignment.dueDate.toISOString().slice(0, 10) : '')
    }),
    maintenanceTasks: maintenance.map(row =>
      mapMaintenance(
        row,
        assetName.get(row.assetId || '') || 'Asset',
        staffName.get(row.assignedTo || '') || staffById.values().next().value?.fullName || 'Owner'
      )
    ),
    risks: risks.map(row => mapRisk({ ...row, owner: staffName.get(row.owner || '') || 'Owner' })),
    documents: documents.map(mapDocument),
    enquiries: enquiries.map(mapEnquiry)
  }
}

export async function createRecord(kind: CreateKind, input: unknown, session: SessionPayload) {
  const campusId = session.campusId
  if (!campusId) throw new Error('No campus assigned')
  const menu = RECORD_MENUS[kind] as MenuKey
  let created: { id: string; tableName: string; payload: unknown }

  if (kind === 'resident') {
    const data = residentSchema.parse(input)
    const row = await prisma.resident.create({
      data: {
        id: id(),
        refNo: `RES-${Date.now().toString(36).toUpperCase()}`,
        fullName: data.name,
        roomNumber: data.room,
        dateOfBirth: data.dateOfBirth,
        status: data.status,
        campusId,
        riskFlags: [data.risk]
      }
    })
    const carePlan = await prisma.carePlanEntry.create({
      data: {
        id: id(),
        residentId: row.id,
        campusId,
        category: 'Care plan',
        status: 'Up to date',
        reviewDate: date(data.nextReview),
        body: 'Fictional demonstration care-plan summary.',
        author: session.sub
      }
    })
    created = {
      id: row.id,
      tableName: 'tbl_resident',
      payload: mapResident({ ...row, carePlanEntries: [carePlan] })
    }
  } else if (kind === 'staff') {
    const data = staffSchema.parse(input)
    const row = await prisma.staffMember.create({
      data: {
        id: id(),
        refNo: `STF-${Date.now().toString(36).toUpperCase()}`,
        fullName: data.name,
        role: data.role,
        employmentType: data.employment,
        status: data.status,
        campusId,
        startDate: date(data.supervisionDate),
        isMedCompetent: false
      }
    })
    void staffCompletion(data.status)
    created = { id: row.id, tableName: 'tbl_staff', payload: mapStaff(row) }
  } else if (kind === 'audit') {
    const data = auditSchema.parse(input)
    const row = await prisma.audit.create({
      data: {
        id: id(),
        refNo: `AUD-${Date.now().toString(36).toUpperCase()}`,
        title: data.title,
        auditDate: date(data.date),
        auditor: data.auditor,
        scope: data.kloe,
        status: data.status,
        campusId,
        cqcResponses: { score: data.score }
      }
    })
    created = { id: row.id, tableName: 'tbl_audit', payload: mapAudit(row) }
  } else if (kind === 'compliance') {
    const data = complianceSchema.parse(input)
    const ownerId = await lookupStaffId(campusId, data.owner)
    const row = await prisma.complianceCheck.create({
      data: {
        id: id(),
        refNo: `CHK-${Date.now().toString(36).toUpperCase()}`,
        title: data.title,
        category: data.kloe,
        dueDate: date(data.dueDate),
        status: data.status,
        assignedTo: ownerId,
        notes: data.owner,
        campusId
      }
    })
    created = { id: row.id, tableName: 'tbl_compliance_check', payload: mapCompliance({ ...row, assignedTo: data.owner }) }
  } else if (kind === 'incident') {
    const data = incidentSchema.parse(input)
    const count = await prisma.incident.count({ where: { campusId } })
    const residentId = await lookupResidentId(campusId, data.resident)
    const row = await prisma.incident.create({
      data: {
        id: id(),
        refNo: incidentReference(data.date, count),
        title: data.resident,
        description: data.summary,
        incidentDate: new Date(`${data.date}T${data.time}:00`),
        severity: data.severity,
        status: data.status,
        location: data.location,
        campusId,
        incidentType: data.type,
        reporterName: data.reporter,
        reportedBy: session.sub,
        residentId
      }
    })
    created = { id: row.id, tableName: 'tbl_incident', payload: mapIncident({ ...row, title: data.resident }) }
  } else if (kind === 'asset') {
    const data = assetSchema.parse(input)
    const row = await prisma.asset.create({
      data: {
        id: id(),
        refNo: `AST-${Date.now().toString(36).toUpperCase()}`,
        name: data.name,
        category: data.category,
        location: data.location,
        serialNumber: data.serial,
        purchaseDate: date(data.purchaseDate),
        warrantyExpiry: date(data.warrantyUntil),
        nextInspectionDate: date(data.nextService),
        status: data.status,
        campusId,
        createdBy: session.sub
      }
    })
    created = { id: row.id, tableName: 'tbl_asset', payload: mapAsset(row) }
  } else if (kind === 'medication') {
    const data = medicationSchema.parse(input)
    const residentId = await lookupResidentId(campusId, data.resident)
    if (!residentId) throw new Error('Resident not found on this campus')
    const row = await prisma.medication.create({
      data: {
        id: id(),
        refNo: `MED-${Date.now().toString(36).toUpperCase()}`,
        residentId,
        campusId,
        medicineName: data.medicine,
        form: 'tablet',
        dose: data.dose,
        route: data.route,
        frequency: data.schedule,
        startDate: new Date(),
        status: data.status.toLowerCase(),
        createdBy: session.sub
      }
    })
    created = { id: row.id, tableName: 'tbl_medication', payload: mapMedication(row, data.resident) }
  } else if (kind === 'rota') {
    const data = rotaSchema.parse(input)
    const staffId = await lookupStaffId(campusId, data.staff)
    if (!staffId) throw new Error('Staff member not found on this campus')
    const row = await prisma.rotaShift.create({
      data: {
        id: id(),
        refNo: `ROT-${Date.now().toString(36).toUpperCase()}`,
        staffId,
        shiftDate: date(data.date),
        shiftStart: `${data.start}:00`.slice(0, 8),
        shiftEnd: `${data.end}:00`.slice(0, 8),
        shiftType: data.type,
        campusId
      }
    })
    created = { id: row.id, tableName: 'tbl_rota', payload: mapRota(row, data.staff) }
  } else if (kind === 'training') {
    const data = trainingSchema.parse(input)
    const row = await prisma.training.create({
      data: {
        id: id(),
        refNo: `TRN-${Date.now().toString(36).toUpperCase()}`,
        title: data.title,
        category: data.category,
        frequency: data.frequency,
        isMandatory: data.category === 'Mandatory',
        status: data.status
      }
    })
    const staffId = await lookupStaffId(campusId, data.owner)
    if (staffId) {
      await prisma.trainingAssignment.create({
        data: {
          id: id(),
          trainingId: row.id,
          staffId,
          assignedBy: session.sub,
          dueDate: date(data.nextDue),
          status: data.status,
          campusId
        }
      })
    }
    created = { id: row.id, tableName: 'tbl_training', payload: mapTraining(row, data.owner, data.nextDue) }
  } else if (kind === 'maintenance') {
    const data = maintenanceSchema.parse(input)
    const assetId = await lookupAssetId(campusId, data.asset)
    const ownerId = await lookupStaffId(campusId, data.owner)
    const row = await prisma.maintenance.create({
      data: {
        id: id(),
        refNo: `MNT-${Date.now().toString(36).toUpperCase()}`,
        title: data.title,
        category: data.category,
        assetId,
        frequency: 'scheduled',
        nextDue: date(data.dueDate),
        assignedTo: ownerId,
        status: data.status,
        priority: data.priority,
        campusId
      }
    })
    created = { id: row.id, tableName: 'tbl_maintenance', payload: mapMaintenance(row, data.asset, data.owner) }
  } else if (kind === 'risk') {
    const data = riskSchema.parse(input)
    const ownerId = await lookupStaffId(campusId, data.owner)
    const level = calculatedRiskLevel(data.likelihood, data.impact)
    const row = await prisma.risk.create({
      data: {
        id: id(),
        refNo: `RSK-${Date.now().toString(36).toUpperCase()}`,
        title: data.title,
        category: data.category,
        likelihood: data.likelihood,
        impact: data.impact,
        riskLevel: level,
        status: data.status,
        owner: ownerId,
        campusId,
        nextReviewDate: date(data.nextReview)
      }
    })
    created = { id: row.id, tableName: 'tbl_risk', payload: mapRisk({ ...row, owner: data.owner }) }
  } else if (kind === 'document') {
    const data = documentSchema.parse(input)
    const row = await prisma.document.create({
      data: {
        id: id(),
        refNo: `DOC-${Date.now().toString(36).toUpperCase()}`,
        title: data.title,
        category: data.category,
        documentType: data.kloe,
        filePath: '',
        fileName: '',
        expiryDate: date(data.reviewDate),
        notes: data.owner,
        uploadedBy: session.sub,
        campusId
      }
    })
    created = { id: row.id, tableName: 'tbl_document', payload: mapDocument(row) }
  } else {
    const data = enquirySchema.parse(input)
    const row = await prisma.enquiry.create({
      data: {
        id: id(),
        refNo: `ENQ-${Date.now().toString(36).toUpperCase()}`,
        campusId,
        enquiryType: data.careType,
        source: data.source,
        dateReceived: new Date(),
        urgency: data.urgency,
        fundingType: 'Not recorded',
        preferredRoomType: data.preferredRoom,
        prospectFullName: data.name,
        stage: data.stage,
        createdBy: session.sub
      }
    })
    created = { id: row.id, tableName: 'tbl_enquiry', payload: mapEnquiry(row) }
  }

  await writeChangeAudit({
    session,
    category: 'create',
    menu,
    tableName: created.tableName,
    recordId: created.id,
    newValues: created.payload
  })
  return created.payload
}
