import PageHeader from "@/components/PageHeader";
import RaceSearch from "@/components/RaceSearch";

export default function RacesPage() {
  return (
    <>
      <PageHeader
        title="Races"
        description="Search RunSignup and import races into the Stryde database."
      />
      <RaceSearch />
    </>
  );
}
