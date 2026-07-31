import { siteConfig } from "@/config/site";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container max-w-2xl py-16">
      <h1 className="mb-4 font-display text-3xl font-semibold">Contact</h1>
      <p className="text-muted-foreground">
        Reach us at{" "}
        <a href={`mailto:${siteConfig.supportEmail}`} className="underline">
          {siteConfig.supportEmail}
        </a>
        . A real contact form (bound to a Zod schema, per
        `components/forms/README.md`) belongs here once there's a
        destination for the submission — an email service, a support
        ticket queue, or similar.
      </p>
    </div>
  );
}
