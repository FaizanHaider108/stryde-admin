import CreateUserForm from "@/components/CreateUserForm";
import UserRowActions from "@/components/UserRowActions";
import PageHeader from "@/components/PageHeader";
import { adminBackendFetch } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";
import { profileImageUrl } from "@/lib/media";
import type { InviteUserOut } from "@/types";
import { FiAlertCircle } from "react-icons/fi";

export default async function UsersPage() {
  let users: InviteUserOut[] = [];
  let error: string | null = null;

  try {
    users = await adminBackendFetch<InviteUserOut[]>("/api/v1/profile/users");
  } catch (e) {
    error =
      e instanceof ApiError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Could not load users.";
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Create accounts and manage registered runners."
      />

      <CreateUserForm />

      {error ? (
        <div className="admin-card mt-6 flex items-start gap-3 border-red-200 bg-red-50 p-5 text-red-900">
          <FiAlertCircle className="mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-medium">Could not load user list</p>
            <p className="mt-1 text-sm opacity-90">{error}</p>
          </div>
        </div>
      ) : (
        <div className="admin-card mt-6 overflow-hidden">
          <div className="border-b border-light-brown/60 px-4 py-3 text-sm text-brown/65">
            {users.length} registered {users.length === 1 ? "user" : "users"}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-light-brown/80 bg-light-brown/30 text-brown/70">
                <tr>
                  <th className="px-4 py-3 font-medium">Runner</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">UID</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const avatar = profileImageUrl(user.profile_image_s3_key);
                  return (
                    <tr
                      key={user.uid}
                      className="border-b border-light-brown/40 last:border-0 hover:bg-light-brown/20"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-light-brown text-xs font-semibold">
                            {avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              user.full_name.charAt(0)
                            )}
                          </div>
                          <span className="font-medium text-brown">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-brown/70">{user.runner_type}</td>
                      <td className="px-4 py-3 font-mono text-xs text-brown/50">{user.uid}</td>
                      <td className="px-4 py-3 text-right">
                        <UserRowActions uid={user.uid} name={user.full_name} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
