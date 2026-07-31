import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId, updateProfile } from "@/services/user.service";
import { updateProfileSchema } from "@/lib/validators/user.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const user = await getUserBySupabaseId(supabaseUser.id);
  if (!user) redirect("/login");

  async function saveProfile(formData: FormData) {
    "use server";

    const parsed = updateProfileSchema.parse({
      firstName: formData.get("firstName")?.toString(),
      lastName: formData.get("lastName")?.toString(),
      phone: formData.get("phone")?.toString() || undefined,
    });

    await updateProfile(user!.id, parsed);
    revalidatePath("/profile");
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-6 font-display text-2xl font-semibold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" name="firstName" defaultValue={user.firstName} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" name="lastName" defaultValue={user.lastName} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user.email} disabled />
              <p className="text-xs text-muted-foreground">
                Managed by your login provider — not editable here yet.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={user.phone ?? ""} />
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
