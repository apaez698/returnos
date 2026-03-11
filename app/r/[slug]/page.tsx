import { RoutePlaceholder } from "@/components/placeholders/route-placeholder";

type ReferralPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ReferralPage({ params }: ReferralPageProps) {
  const { slug } = await params;

  return (
    <RoutePlaceholder
      title={`Referral Link: ${slug}`}
      description="Public short link endpoint placeholder for campaigns and customer journeys."
    />
  );
}
