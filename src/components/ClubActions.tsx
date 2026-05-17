"use client";

import AdminDeleteButton from "@/components/AdminDeleteButton";

type Props = {
  clubId: string;
  clubName: string;
  isCommunity?: boolean;
};

export default function ClubActions({ clubId, clubName, isCommunity }: Props) {
  if (isCommunity) {
    return <span className="text-xs text-brown/50">Protected</span>;
  }

  return (
    <AdminDeleteButton
      label="Delete club"
      confirmMessage={`Delete club "${clubName}"? This cannot be undone.`}
      apiPath={`clubs/${clubId}`}
      onSuccessRedirect="/clubs"
    />
  );
}
