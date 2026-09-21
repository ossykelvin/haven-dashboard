import { PrismaClient, type AppRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { MENU_DEFINITIONS, ROLE_MENUS } from '../src/lib/menus'
import { initialData } from '../src/lib/mock-data'

const prisma = new PrismaClient()

const ORG_ID = 'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1'
const CAMPUS_ID = 'b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2'
const POLICY_ID = 'c3c3c3c3-c3c3-43c3-83c3-c3c3c3c3c3c3'
const LICENSE_ID = 'd4d4d4d4-d4d4-44d4-84d4-d4d4d4d4d4d4'
const HOME_CHAT = 'e5e5e5e5-e5e5-45e5-85e5-e5e5e5e5e5e5'

const USERS: Array<{ id: string; email: string; name: string; role: AppRole; staffName?: string }> = [
  { id: '11111111-1111-4111-8111-111111111111', email: 'admin@haven.example', name: 'Olivia Bennett', role: 'admin', staffName: 'Olivia Bennett' },
  { id: '22222222-2222-4222-8222-222222222222', email: 'manager@haven.example', name: 'Amelia Wright', role: 'manager', staffName: 'Amelia Wright' },
  { id: '33333333-3333-4333-8333-333333333333', email: 'staff@haven.example', name: 'Priya Shah', role: 'staff', staffName: 'Priya Shah' },
  { id: '44444444-4444-4444-8444-444444444444', email: 'admissions@haven.example', name: 'Helen Foster', role: 'admissions' },
  { id: '55555555-5555-4555-8555-555555555555', email: 'clerk@haven.example', name: 'Daniel Hughes', role: 'clerk', staffName: 'Daniel Hughes' },
  { id: '66666666-6666-4666-8666-666666666666', email: 'shiftlead@haven.example', name: 'Jack Thompson', role: 'shift_lead', staffName: 'Jack Thompson' }
]

function atNoon(value: string) {
  return new Date(`${value}T12:00:00.000Z`)
}

function clock(value: string) {
  return value.length === 5 ? `${value}:00` : value
}

async function main() {
  const password = process.env.HAVEN_DEMO_PASSWORD || 'HavenDemo!2026'
  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0')
  const tables = await prisma.$queryRaw<Array<{ Tables_in_haven: string }>>`SHOW TABLES`
  for (const row of tables) {
    const name = Object.values(row)[0]
    if (name) await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${name}\``)
  }
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1')

  await prisma.organization.create({
    data: {
      id: ORG_ID,
      name: 'Haven Care Group',
      cqcId: 'DEMO-CQC',
      passwordMinLength: 12,
      emailFromName: 'Haven'
    }
  })

  await prisma.campus.create({
    data: {
      id: CAMPUS_ID,
      name: 'Rosewood House',
      status: 'active',
      isHeadOffice: true,
      organizationId: ORG_ID,
      refNo: 'CAM-ROSEWOOD'
    }
  })

  await prisma.license.create({
    data: { id: LICENSE_ID, campusAllowance: 5, residentAllowance: 80 }
  })

  await prisma.securityPolicy.create({
    data: {
      id: POLICY_ID,
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSymbol: true,
      preventReuseCount: 5,
      lockoutThreshold: 8,
      auditRetentionMonths: 24
    }
  })

  await prisma.emailSendState.create({
    data: { id: 1, batchSize: 20, sendDelayMs: 250, authEmailTtlMinutes: 60, transactionalEmailTtlMinutes: 1440 }
  })

  for (const [index, item] of MENU_DEFINITIONS.entries()) {
    await prisma.menuDefinition.create({
      data: {
        id: `0a0a0a0a-0000-4000-8000-${String(index).padStart(12, '0')}`,
        menuKey: item.menuKey,
        label: item.label,
        groupName: item.groupName
      }
    })
  }

  for (const role of Object.keys(ROLE_MENUS) as AppRole[]) {
    await prisma.roleDefinition.create({
      data: { name: role, isProtected: role === 'admin' || role === 'staff' }
    })
    for (const menuKey of ROLE_MENUS[role]) {
      await prisma.roleMenu.create({
        data: { id: crypto.randomUUID(), role, menuKey }
      })
    }
  }

  const staffIds = new Map<string, string>()
  for (const member of initialData.staff) {
    const row = await prisma.staffMember.create({
      data: {
        id: crypto.randomUUID(),
        refNo: member.id,
        fullName: member.name,
        role: member.role,
        employmentType: member.employment,
        status: member.status,
        campusId: CAMPUS_ID,
        staffCode: member.id,
        isMedCompetent: member.name === 'Priya Shah' || member.name === 'Amelia Wright'
      }
    })
    staffIds.set(member.name, row.id)
  }

  const residentIds = new Map<string, string>()
  for (const resident of initialData.residents) {
    const row = await prisma.resident.create({
      data: {
        id: crypto.randomUUID(),
        refNo: resident.id,
        fullName: resident.name,
        dateOfBirth: resident.dateOfBirth,
        roomNumber: resident.room,
        status: resident.status,
        campusId: CAMPUS_ID,
        residentCode: resident.id,
        riskFlags: [resident.risk]
      }
    })
    residentIds.set(resident.name, row.id)
    await prisma.carePlanEntry.create({
      data: {
        id: crypto.randomUUID(),
        residentId: row.id,
        campusId: CAMPUS_ID,
        category: 'Care plan',
        status: resident.carePlan,
        reviewDate: atNoon(resident.nextReview),
        body: 'Fictional demonstration care-plan summary.'
      }
    })
  }

  const assetIds = new Map<string, string>()
  for (const asset of initialData.assets) {
    const row = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        refNo: asset.id,
        name: asset.name,
        category: asset.category,
        location: asset.location,
        serialNumber: asset.serial,
        purchaseDate: atNoon(asset.purchaseDate),
        warrantyExpiry: atNoon(asset.warrantyUntil),
        nextInspectionDate: atNoon(asset.nextService),
        status: asset.status,
        campusId: CAMPUS_ID
      }
    })
    assetIds.set(asset.name, row.id)
  }

  for (const user of USERS) {
    await prisma.authUser.create({
      data: { id: user.id, email: user.email, passwordHash }
    })
    await prisma.userEmail.create({
      data: { userId: user.id, emailLower: user.email }
    })
    await prisma.profile.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        fullName: user.name,
        isActivated: true,
        campusId: CAMPUS_ID,
        staffId: user.staffName ? staffIds.get(user.staffName) ?? null : null,
        accountType: 'captive',
        sessionTimeoutMinutes: 480
      }
    })
    await prisma.userRole.create({
      data: { id: crypto.randomUUID(), userId: user.id, role: user.role }
    })
    await prisma.passwordHistory.create({
      data: { id: crypto.randomUUID(), userId: user.id, passwordHash }
    })
  }

  for (const check of initialData.complianceChecks) {
    await prisma.complianceCheck.create({
      data: {
        id: crypto.randomUUID(),
        refNo: check.id,
        title: check.title,
        category: check.kloe,
        dueDate: atNoon(check.dueDate),
        status: check.status,
        assignedTo: staffIds.get(check.owner) ?? null,
        notes: check.owner,
        campusId: CAMPUS_ID
      }
    })
  }

  for (const audit of initialData.audits) {
    await prisma.audit.create({
      data: {
        id: crypto.randomUUID(),
        refNo: audit.id,
        title: audit.title,
        auditDate: atNoon(audit.date),
        auditor: audit.auditor,
        scope: audit.kloe,
        status: audit.status,
        campusId: CAMPUS_ID,
        cqcResponses: { score: audit.score, actions: audit.actions }
      }
    })
  }

  for (const incident of initialData.incidents) {
    await prisma.incident.create({
      data: {
        id: crypto.randomUUID(),
        refNo: incident.reference,
        title: incident.resident,
        description: incident.summary,
        incidentDate: new Date(`${incident.date}T${incident.time}:00`),
        severity: incident.severity,
        status: incident.status,
        location: incident.location,
        campusId: CAMPUS_ID,
        incidentType: incident.type,
        reporterName: incident.reporter,
        residentId: residentIds.get(incident.resident) ?? null
      }
    })
  }

  for (const item of initialData.notifications) {
    await prisma.notification.create({
      data: {
        id: item.id.startsWith('NTF') ? crypto.randomUUID() : crypto.randomUUID(),
        userId: USERS[0].id,
        title: item.title,
        message: item.message,
        type: item.type,
        isRead: item.read,
        createdAt: new Date(item.date)
      }
    })
  }

  for (const med of initialData.medications) {
    const residentId = residentIds.get(med.resident)
    if (!residentId) continue
    const medication = await prisma.medication.create({
      data: {
        id: crypto.randomUUID(),
        refNo: med.id,
        residentId,
        campusId: CAMPUS_ID,
        medicineName: med.medicine,
        form: 'tablet',
        dose: med.dose,
        route: med.route,
        frequency: med.schedule,
        startDate: new Date('2026-09-01'),
        status: med.status.toLowerCase()
      }
    })
    const times = med.schedule.includes('08:00') ? ['08:00:00', '20:00:00'] : ['08:00:00']
    for (const scheduledTime of times) {
      await prisma.medicationSchedule.create({
        data: {
          id: crypto.randomUUID(),
          medicationId: medication.id,
          campusId: CAMPUS_ID,
          scheduledTime,
          active: true
        }
      })
    }
  }

  for (const shift of initialData.rotaShifts) {
    const staffId = staffIds.get(shift.staff)
    if (!staffId) continue
    await prisma.rotaShift.create({
      data: {
        id: crypto.randomUUID(),
        refNo: shift.id,
        staffId,
        shiftDate: atNoon(shift.date),
        shiftStart: clock(shift.start),
        shiftEnd: clock(shift.end),
        shiftType: shift.type,
        campusId: CAMPUS_ID
      }
    })
  }

  for (const course of initialData.trainings) {
    const training = await prisma.training.create({
      data: {
        id: crypto.randomUUID(),
        refNo: course.id,
        title: course.title,
        category: course.category,
        frequency: course.frequency,
        isMandatory: course.category === 'Mandatory',
        status: course.status
      }
    })
    const staffId = staffIds.get(course.owner)
    if (staffId) {
      await prisma.trainingAssignment.create({
        data: {
          id: crypto.randomUUID(),
          trainingId: training.id,
          staffId,
          dueDate: atNoon(course.nextDue),
          status: course.status,
          campusId: CAMPUS_ID
        }
      })
    }
  }

  for (const task of initialData.maintenanceTasks) {
    await prisma.maintenance.create({
      data: {
        id: crypto.randomUUID(),
        refNo: task.id,
        title: task.title,
        category: task.category,
        assetId: assetIds.get(task.asset) ?? null,
        frequency: 'scheduled',
        nextDue: atNoon(task.dueDate),
        assignedTo: staffIds.get(task.owner) ?? null,
        status: task.status,
        priority: task.priority,
        campusId: CAMPUS_ID
      }
    })
  }

  for (const risk of initialData.risks) {
    await prisma.risk.create({
      data: {
        id: crypto.randomUUID(),
        refNo: risk.id,
        title: risk.title,
        category: risk.category,
        likelihood: risk.likelihood,
        impact: risk.impact,
        riskLevel: risk.level,
        status: risk.status,
        owner: staffIds.get(risk.owner) ?? null,
        campusId: CAMPUS_ID,
        nextReviewDate: atNoon(risk.nextReview)
      }
    })
  }

  for (const doc of initialData.documents) {
    await prisma.document.create({
      data: {
        id: crypto.randomUUID(),
        refNo: doc.id,
        title: doc.title,
        category: doc.category,
        documentType: doc.kloe,
        filePath: '',
        fileName: `${doc.title}.pdf`,
        expiryDate: atNoon(doc.reviewDate),
        notes: doc.owner,
        campusId: CAMPUS_ID
      }
    })
  }

  for (const enquiry of initialData.enquiries) {
    const row = await prisma.enquiry.create({
      data: {
        id: crypto.randomUUID(),
        refNo: enquiry.id,
        campusId: CAMPUS_ID,
        enquiryType: enquiry.careType,
        source: enquiry.source,
        dateReceived: new Date('2026-09-10'),
        urgency: enquiry.urgency,
        fundingType: 'Not recorded',
        preferredRoomType: enquiry.preferredRoom,
        prospectFullName: enquiry.name,
        stage: enquiry.stage
      }
    })
    await prisma.enquiryTask.create({
      data: {
        id: crypto.randomUUID(),
        enquiryId: row.id,
        campusId: CAMPUS_ID,
        title: `Follow up ${enquiry.name}`,
        dueDate: new Date('2026-09-24'),
        priority: 'Medium',
        status: 'Open'
      }
    })
    await prisma.enquiryVisit.create({
      data: {
        id: crypto.randomUUID(),
        enquiryId: row.id,
        campusId: CAMPUS_ID,
        visitAt: new Date('2026-09-21T14:00:00'),
        visitorName: 'Family visitor',
        status: 'Booked'
      }
    })
  }

  const kloePrompts = [
    { category: 'Safe', text: 'Medicines are managed safely and MAR charts are complete.', sortOrder: 1 },
    { category: 'Effective', text: 'Care plans are reviewed and reflect current needs.', sortOrder: 2 },
    { category: 'Caring', text: 'Staff treat people with dignity and respect.', sortOrder: 3 },
    { category: 'Responsive', text: 'People can influence activities and daily routines.', sortOrder: 4 },
    { category: 'Well-led', text: 'Governance meetings track open actions to closure.', sortOrder: 5 }
  ]
  for (const item of kloePrompts) {
    await prisma.cqcCheck.create({
      data: {
        id: crypto.randomUUID(),
        category: item.category,
        body: item.text,
        sortOrder: item.sortOrder,
        campusId: CAMPUS_ID
      }
    })
  }

  await prisma.emailTemplate.create({
    data: {
      id: crypto.randomUUID(),
      name: 'enquiry-acknowledgement',
      displayName: 'Enquiry acknowledgement',
      subject: 'Thank you for contacting Rosewood House',
      html: '<p>This is a demonstration template. No personal data is sent.</p>',
      description: 'Logged locally when SMTP is not configured.',
      isActive: true
    }
  })

  await prisma.chatConversation.create({
    data: {
      id: HOME_CHAT,
      name: 'Rosewood House',
      isGroup: true,
      createdBy: USERS[0].id
    }
  })
  for (const user of USERS) {
    await prisma.chatParticipant.create({
      data: {
        id: crypto.randomUUID(),
        conversationId: HOME_CHAT,
        userId: user.id
      }
    })
  }
  await prisma.chatMessage.create({
    data: {
      id: crypto.randomUUID(),
      conversationId: HOME_CHAT,
      senderId: USERS[1].id,
      content: 'Night staffing cover is confirmed for Friday.'
    }
  })

  await prisma.shiftType.createMany({
    data: [
      { id: crypto.randomUUID(), key: 'early', label: 'Early', startTime: '07:00:00', endTime: '14:00:00', color: '#2563eb', sortOrder: 1 },
      { id: crypto.randomUUID(), key: 'late', label: 'Late', startTime: '14:00:00', endTime: '21:00:00', color: '#7c3aed', sortOrder: 2 },
      { id: crypto.randomUUID(), key: 'night', label: 'Night', startTime: '20:00:00', endTime: '08:00:00', color: '#0f172a', sortOrder: 3 },
      { id: crypto.randomUUID(), key: 'long-day', label: 'Long day', startTime: '08:00:00', endTime: '20:00:00', color: '#059669', sortOrder: 4 }
    ]
  })

  await prisma.employmentType.createMany({
    data: [
      { id: crypto.randomUUID(), key: 'permanent', label: 'Permanent', weeklyHours: 37.5, sortOrder: 1 },
      { id: crypto.randomUUID(), key: 'bank', label: 'Bank', weeklyHours: 0, sortOrder: 2 },
      { id: crypto.randomUUID(), key: 'agency', label: 'Agency', weeklyHours: 0, sortOrder: 3 }
    ]
  })

  console.log('Seeded Haven demonstration data for Rosewood House')
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
