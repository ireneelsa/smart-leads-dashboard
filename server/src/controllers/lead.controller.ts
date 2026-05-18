import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ILead, LEAD_STATUSES, Lead, LeadStatus } from "../models/Lead";

function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

export async function getLeads(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, search } = req.query;
    const filter: Record<string, unknown> = { owner: req.user!.userId };

    if (typeof status === "string" && status.length > 0) {
      if (!isLeadStatus(status)) {
        res.status(400).json({ message: "Invalid status filter" });
        return;
      }
      filter.status = status;
    }

    if (typeof search === "string" && search.trim()) {
      const term = search.trim();
      const regex = new RegExp(term, "i");
      filter.$or = [{ name: regex }, { email: regex }, { company: regex }];
    }

    const leads = await Lead.find(filter).sort({ updatedAt: -1 });
    res.json(leads);
  } catch {
    res.status(500).json({ message: "Failed to fetch leads" });
  }
}

export async function getLeadStats(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const owner = req.user!.userId;
    const [total, byStatus] = await Promise.all([
      Lead.countDocuments({ owner }),
      Lead.aggregate<{ _id: LeadStatus; count: number }>([
        { $match: { owner } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const statusCounts = LEAD_STATUSES.reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<LeadStatus, number>,
    );

    for (const row of byStatus) {
      statusCounts[row._id] = row.count;
    }

    res.json({ total, byStatus: statusCounts });
  } catch {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
}

export async function createLead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, company, phone, status, notes } = req.body as Partial<
      ILead
    >;

    if (!name?.trim() || !email?.trim()) {
      res.status(400).json({ message: "Name and email are required" });
      return;
    }

    if (status && !isLeadStatus(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: email.trim(),
      company,
      phone,
      status,
      notes,
      owner: req.user!.userId,
    });

    res.status(201).json(lead);
  } catch {
    res.status(500).json({ message: "Failed to create lead" });
  }
}

export async function updateLead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      owner: req.user!.userId,
    });

    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    const { name, email, company, phone, status, notes } = req.body as Partial<
      ILead
    >;

    if (status && !isLeadStatus(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    if (name !== undefined) lead.name = name.trim();
    if (email !== undefined) lead.email = email.trim();
    if (company !== undefined) lead.company = company;
    if (phone !== undefined) lead.phone = phone;
    if (status !== undefined) lead.status = status;
    if (notes !== undefined) lead.notes = notes;

    await lead.save();
    res.json(lead);
  } catch {
    res.status(500).json({ message: "Failed to update lead" });
  }
}

export async function deleteLead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      owner: req.user!.userId,
    });

    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    res.json({ message: "Lead deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete lead" });
  }
}
