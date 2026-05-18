import { useEffect, useMemo, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import { createLead, updateLead } from "../api/leads";
import type { ILead, LeadSource, LeadStatus } from "../types";
import { LEAD_SOURCES, LEAD_STATUSES } from "../types";
import { SOURCE_LABELS, STATUS_LABELS } from "../utils";

type LeadModalMode = "create" | "edit";

interface LeadModalProps {
  mode: LeadModalMode;
  lead?: ILead;
  onClose: () => void;
  refetch: () => Promise<void> | void;
}

interface LeadFormState {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
}

type FieldErrors = Partial<Record<keyof LeadFormState, string>>;

const emptyForm: LeadFormState = {
  name: "",
  email: "",
  status: "new",
  source: "website",
};

const fieldClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getInitialForm(mode: LeadModalMode, lead?: ILead): LeadFormState {
  if (mode === "edit" && lead) {
    return {
      name: lead.name,
      email: lead.email,
      status: lead.status,
      source: lead.source,
    };
  }

  return emptyForm;
}

function validateForm(form: LeadFormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.status) {
    errors.status = "Status is required.";
  }

  if (!form.source) {
    errors.source = "Source is required.";
  }

  return errors;
}

export default function LeadModal({
  mode,
  lead,
  onClose,
  refetch,
}: LeadModalProps) {
  const [form, setForm] = useState<LeadFormState>(() =>
    getInitialForm(mode, lead),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = mode === "create" ? "New lead" : "Edit lead";
  const submitLabel = mode === "create" ? "Create lead" : "Save changes";

  const hasErrors = useMemo(
    () => Object.values(errors).some(Boolean),
    [errors],
  );

  useEffect(() => {
    setForm(getInitialForm(mode, lead));
    setErrors({});
    setSubmitError("");
  }, [lead, mode]);

  function updateField<Key extends keyof LeadFormState>(
    field: Key,
    value: LeadFormState[Key],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (mode === "edit" && !lead) {
      setSubmitError("Lead details are missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const editLead = mode === "edit" ? lead : undefined;
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        status: form.status,
        source: form.source,
      };

      if (mode === "create") {
        await createLead(payload);
      } else if (editLead) {
        await updateLead(editLead.id, payload);
      }

      await refetch();
      onClose();
    } catch {
      setSubmitError("Could not save lead. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="lead-modal-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {submitError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <div>
            <label
              htmlFor="lead-name"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id="lead-name"
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              disabled={isSubmitting}
              className={fieldClass}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="lead-email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="lead-email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              disabled={isSubmitting}
              className={fieldClass}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="lead-status"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Status
              </label>
              <select
                id="lead-status"
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as LeadStatus)
                }
                disabled={isSubmitting}
                className={fieldClass}
                aria-invalid={errors.status ? "true" : "false"}
              >
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-xs text-red-600">{errors.status}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="lead-source"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Source
              </label>
              <select
                id="lead-source"
                value={form.source}
                onChange={(event) =>
                  updateField("source", event.target.value as LeadSource)
                }
                disabled={isSubmitting}
                className={fieldClass}
                aria-invalid={errors.source ? "true" : "false"}
              >
                {LEAD_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {SOURCE_LABELS[source]}
                  </option>
                ))}
              </select>
              {errors.source && (
                <p className="mt-1 text-xs text-red-600">{errors.source}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || hasErrors}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
