"use client";

import { UserRound } from "lucide-react";
import { Badge, InfoItem } from "@/lib/ui";
import {
  memberFullName,
  memberPoleText,
  roleLabels,
  roleStyles,
  statusLabels,
  statusStyles,
} from "./member-rules";
import type { MemberView } from "./member-dto";

type Props = {
  member: MemberView | null;
};

export function MemberDetailPanel({ member }: Props) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <UserRound className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="font-semibold text-zinc-950">
            {member ? memberFullName(member) : "Aucun membre"}
          </h2>
          <p className="text-sm text-zinc-500">
            {member ? member.email : "Selectionner un membre"}
          </p>
        </div>
      </div>

      {member ? (
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <InfoItem label="Telephone" value={member.phone} />
          <InfoItem label="Annee" value={member.year} />
          <InfoItem label="Role" value={roleLabels[member.role]} />
          <InfoItem label="Statut" value={statusLabels[member.status]} />
          <div className="col-span-2 rounded-lg bg-zinc-50 p-3">
            <dt className="text-zinc-500">Poles</dt>
            <dd className="font-medium text-zinc-900">{memberPoleText(member)}</dd>
          </div>
          {member.discordUsername ? (
            <div className="col-span-2 rounded-lg bg-zinc-50 p-3">
              <dt className="text-zinc-500">Discord</dt>
              <dd className="font-medium text-zinc-900">{member.discordUsername}</dd>
            </div>
          ) : null}
          <div className="col-span-2 flex gap-2">
            <Badge className={roleStyles[member.role]}>
              {roleLabels[member.role]}
            </Badge>
            <Badge className={statusStyles[member.status]}>
              {statusLabels[member.status]}
            </Badge>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
