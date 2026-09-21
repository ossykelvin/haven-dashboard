'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useHavenData } from '@/components/data-provider'
import {
  ASSET_CATEGORIES,
  ASSET_CONDITIONS,
  ASSET_STATUSES,
  AUDIT_STATUSES,
  COMPLIANCE_STATUSES,
  DOCUMENT_CATEGORIES,
  DOCUMENT_STATUSES,
  EMPLOYMENT_TYPES,
  ENQUIRY_CARE_TYPES,
  ENQUIRY_SOURCES,
  ENQUIRY_STAGES,
  ENQUIRY_URGENCIES,
  INCIDENT_STATUSES,
  INCIDENT_TYPES,
  KLOES,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
  MEDICATION_ROUTES,
  MEDICATION_STATUSES,
  RESIDENT_STATUSES,
  RISK_CATEGORIES,
  RISK_LEVELS,
  RISK_LIKELIHOODS,
  RISK_STATUSES,
  SEVERITIES,
  SHIFT_TYPES,
  STAFF_STATUSES,
  TRAINING_CATEGORIES,
  TRAINING_FREQUENCIES,
  TRAINING_STATUSES
} from '@/lib/constants'
import { firstSchemaError, schemas, type CreateKind } from '@/lib/schemas'
import { nativeSelectClassName, nativeTextareaClassName } from '@/components/shared'
import { cn } from '@/lib/utils'

type Field = {
  name: string
  label: string
  type?: 'text' | 'date' | 'time' | 'number' | 'textarea' | 'select'
  options?: readonly string[]
  defaultValue?: string | number
  placeholder?: string
  wide?: boolean
}

const configurations: Record<CreateKind, { title: string; description: string; submit: string; fields: Field[] }> = {
  resident: {
    title: 'Add resident',
    description: 'Create a resident profile and set the first care-plan review.',
    submit: 'Add resident',
    fields: [
      { name: 'name', label: 'Full name', placeholder: 'e.g. Mary Jones', wide: true },
      { name: 'room', label: 'Room', placeholder: 'e.g. 14B' },
      { name: 'dateOfBirth', label: 'Date of birth', type: 'date' },
      { name: 'risk', label: 'Risk level', type: 'select', options: RISK_LEVELS, defaultValue: 'Low' },
      { name: 'status', label: 'Residency status', type: 'select', options: RESIDENT_STATUSES },
      { name: 'nextReview', label: 'Next care-plan review', type: 'date', wide: true }
    ]
  },
  staff: {
    title: 'Add staff member',
    description: 'Add an employee and their core workforce compliance dates.',
    submit: 'Add staff member',
    fields: [
      { name: 'name', label: 'Full name', placeholder: 'e.g. Hannah Green' },
      { name: 'role', label: 'Role', placeholder: 'e.g. Care Assistant' },
      { name: 'employment', label: 'Employment type', type: 'select', options: EMPLOYMENT_TYPES },
      { name: 'status', label: 'Compliance status', type: 'select', options: STAFF_STATUSES },
      { name: 'dbsExpiry', label: 'DBS expiry', type: 'date' },
      { name: 'nextTraining', label: 'Next training', type: 'date' },
      { name: 'supervisionDate', label: 'Next supervision', type: 'date', wide: true }
    ]
  },
  audit: {
    title: 'Schedule audit',
    description: 'Plan a quality audit against one of the five CQC KLOEs.',
    submit: 'Schedule audit',
    fields: [
      { name: 'title', label: 'Audit title', placeholder: 'e.g. Infection control', wide: true },
      { name: 'kloe', label: 'CQC KLOE', type: 'select', options: KLOES },
      { name: 'auditor', label: 'Auditor', placeholder: 'e.g. Olivia Bennett' },
      { name: 'date', label: 'Audit date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: AUDIT_STATUSES },
      { name: 'score', label: 'Current score (%)', type: 'number', defaultValue: 0 }
    ]
  },
  compliance: {
    title: 'Add compliance check',
    description: 'Assign a trackable compliance check to a CQC key line of enquiry.',
    submit: 'Add check',
    fields: [
      { name: 'title', label: 'Check title', placeholder: 'e.g. Night staffing spot check', wide: true },
      { name: 'kloe', label: 'CQC KLOE', type: 'select', options: KLOES },
      { name: 'owner', label: 'Owner', placeholder: 'e.g. Amelia Wright' },
      { name: 'dueDate', label: 'Due date', type: 'date' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: COMPLIANCE_STATUSES,
        defaultValue: 'In progress'
      },
      { name: 'progress', label: 'Progress (%)', type: 'number', defaultValue: 0 }
    ]
  },
  incident: {
    title: 'Report incident',
    description: 'Record the initial facts. Sensitive details should remain factual and necessary.',
    submit: 'Report incident',
    fields: [
      { name: 'type', label: 'Incident type', type: 'select', options: INCIDENT_TYPES },
      { name: 'severity', label: 'Severity', type: 'select', options: SEVERITIES, defaultValue: 'Medium' },
      { name: 'status', label: 'Status', type: 'select', options: INCIDENT_STATUSES, defaultValue: 'Open' },
      { name: 'location', label: 'Location', placeholder: 'e.g. Ground floor lounge' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'time', label: 'Time', type: 'time' },
      { name: 'resident', label: 'Resident', placeholder: 'e.g. Margaret Wilson' },
      { name: 'reporter', label: 'Reported by', placeholder: 'e.g. Jack Thompson' },
      {
        name: 'summary',
        label: 'Factual summary',
        type: 'textarea',
        placeholder: 'What happened and what immediate action was taken?',
        wide: true
      }
    ]
  },
  asset: {
    title: 'Register asset',
    description: 'Add equipment to the service, warranty, and condition register.',
    submit: 'Register asset',
    fields: [
      { name: 'name', label: 'Asset name', placeholder: 'e.g. Mobile shower chair' },
      { name: 'category', label: 'Category', type: 'select', options: ASSET_CATEGORIES },
      { name: 'serial', label: 'Serial number', placeholder: 'e.g. MSC-20441' },
      { name: 'location', label: 'Location', placeholder: 'e.g. Ground floor wet room' },
      { name: 'purchaseDate', label: 'Purchase date', type: 'date' },
      { name: 'warrantyUntil', label: 'Warranty until', type: 'date' },
      { name: 'lastService', label: 'Last service', type: 'date' },
      { name: 'nextService', label: 'Next service', type: 'date' },
      { name: 'condition', label: 'Condition', type: 'select', options: ASSET_CONDITIONS, defaultValue: 'Good' },
      { name: 'status', label: 'Status', type: 'select', options: ASSET_STATUSES }
    ]
  },
  medication: {
    title: 'Add medication',
    description: 'Record a prescribed medicine on the demonstration MAR.',
    submit: 'Add medication',
    fields: [
      { name: 'resident', label: 'Resident', placeholder: 'e.g. Margaret Wilson' },
      { name: 'medicine', label: 'Medicine', placeholder: 'e.g. Paracetamol 500mg' },
      { name: 'dose', label: 'Dose', placeholder: 'e.g. 1 tablet' },
      { name: 'route', label: 'Route', type: 'select', options: MEDICATION_ROUTES },
      { name: 'schedule', label: 'Schedule', placeholder: 'e.g. 08:00 / 20:00', wide: true },
      { name: 'status', label: 'Status', type: 'select', options: MEDICATION_STATUSES }
    ]
  },
  rota: {
    title: 'Add shift',
    description: 'Plan cover for the demonstration rota.',
    submit: 'Add shift',
    fields: [
      { name: 'staff', label: 'Staff member', placeholder: 'e.g. Priya Shah', wide: true },
      { name: 'date', label: 'Shift date', type: 'date' },
      { name: 'type', label: 'Shift type', type: 'select', options: SHIFT_TYPES },
      { name: 'start', label: 'Start', type: 'time' },
      { name: 'end', label: 'End', type: 'time' }
    ]
  },
  training: {
    title: 'Add training',
    description: 'Add a course to the workforce training register.',
    submit: 'Add training',
    fields: [
      { name: 'title', label: 'Course title', placeholder: 'e.g. Moving and handling', wide: true },
      { name: 'category', label: 'Category', type: 'select', options: TRAINING_CATEGORIES },
      { name: 'frequency', label: 'Frequency', type: 'select', options: TRAINING_FREQUENCIES },
      { name: 'owner', label: 'Owner', placeholder: 'e.g. Amelia Wright' },
      { name: 'nextDue', label: 'Next due', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: TRAINING_STATUSES }
    ]
  },
  maintenance: {
    title: 'Add maintenance task',
    description: 'Schedule planned or reactive work against equipment.',
    submit: 'Add task',
    fields: [
      { name: 'title', label: 'Task title', placeholder: 'e.g. Hoist LOLER inspection', wide: true },
      { name: 'category', label: 'Category', type: 'select', options: MAINTENANCE_CATEGORIES },
      { name: 'asset', label: 'Linked asset', placeholder: 'e.g. Oxford Journey Hoist' },
      { name: 'owner', label: 'Owner', placeholder: 'e.g. Daniel Hughes' },
      { name: 'dueDate', label: 'Due date', type: 'date' },
      { name: 'priority', label: 'Priority', type: 'select', options: MAINTENANCE_PRIORITIES },
      { name: 'status', label: 'Status', type: 'select', options: MAINTENANCE_STATUSES, wide: true }
    ]
  },
  risk: {
    title: 'Add risk',
    description: 'Record a risk, likelihood, impact, and review date.',
    submit: 'Add risk',
    fields: [
      { name: 'title', label: 'Risk title', placeholder: 'e.g. Night staffing shortfall', wide: true },
      { name: 'category', label: 'Category', type: 'select', options: RISK_CATEGORIES },
      { name: 'likelihood', label: 'Likelihood', type: 'select', options: RISK_LIKELIHOODS },
      { name: 'impact', label: 'Impact', type: 'select', options: RISK_LIKELIHOODS },
      { name: 'owner', label: 'Owner', placeholder: 'e.g. Olivia Bennett' },
      { name: 'nextReview', label: 'Next review', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: RISK_STATUSES, wide: true }
    ]
  },
  document: {
    title: 'Add evidence document',
    description: 'Register a policy, certificate, or inspection evidence record. Files stay out of this demonstration.',
    submit: 'Add document',
    fields: [
      { name: 'title', label: 'Title', placeholder: 'e.g. Medication administration policy', wide: true },
      { name: 'category', label: 'Category', type: 'select', options: DOCUMENT_CATEGORIES },
      { name: 'kloe', label: 'CQC KLOE', type: 'select', options: KLOES },
      { name: 'owner', label: 'Owner', placeholder: 'e.g. Amelia Wright' },
      { name: 'reviewDate', label: 'Review date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: DOCUMENT_STATUSES }
    ]
  },
  enquiry: {
    title: 'Add enquiry',
    description: 'Record a prospective admission without storing contact or health identifiers.',
    submit: 'Add enquiry',
    fields: [
      { name: 'name', label: 'Prospect name', placeholder: 'e.g. Helen Foster', wide: true },
      { name: 'source', label: 'Source', type: 'select', options: ENQUIRY_SOURCES },
      { name: 'careType', label: 'Care type', type: 'select', options: ENQUIRY_CARE_TYPES },
      { name: 'urgency', label: 'Urgency', type: 'select', options: ENQUIRY_URGENCIES },
      { name: 'stage', label: 'Stage', type: 'select', options: ENQUIRY_STAGES },
      { name: 'preferredRoom', label: 'Preferred room / area', placeholder: 'e.g. Ground floor' }
    ]
  }
}

function FormField({ field }: { field: Field }) {
  const id = `create-${field.name}`
  return (
    <div className={cn('space-y-2', field.wide && 'sm:col-span-2')}>
      <Label htmlFor={id}>{field.label}</Label>
      {field.type === 'select' ? (
        <select
          id={id}
          name={field.name}
          defaultValue={field.defaultValue ?? field.options?.[0]}
          className={cn(nativeSelectClassName, 'w-full font-normal text-slate-800')}
        >
          {field.options?.map(option => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea id={id} name={field.name} required placeholder={field.placeholder} className={nativeTextareaClassName} />
      ) : (
        <Input
          id={id}
          name={field.name}
          type={field.type ?? 'text'}
          defaultValue={field.defaultValue}
          placeholder={field.placeholder}
          min={field.type === 'number' ? 0 : undefined}
          max={field.type === 'number' ? 100 : undefined}
          required
        />
      )}
    </div>
  )
}

export function CreateDialog({ kind, children }: { kind: CreateKind; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const { createRecord } = useHavenData()
  const configuration = configurations[kind]

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    const parsed = schemas[kind].safeParse(Object.fromEntries(new FormData(form)))
    if (!parsed.success) {
      setError(firstSchemaError(parsed.error))
      return
    }
    try {
      await createRecord(kind, parsed.data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save')
      return
    }

    form.reset()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen)
        if (nextOpen) setError('')
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{configuration.title}</DialogTitle>
          <DialogDescription>{configuration.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {configuration.fields.map(field => (
              <FormField field={field} key={field.name} />
            ))}
          </div>
          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{configuration.submit}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
