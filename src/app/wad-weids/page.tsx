import { SiteHeader } from "@/components/wadweids/SiteHeader";
import { SiteFooter } from "@/components/wadweids/SiteFooter";
import { HomeContent } from "@/components/wadweids/HomeContent";
import { myTourist } from "@/lib/wadweids/mytourist";

/* De homepage vraagt de collectie op via de PMS-adapter — niet uit een
   lijst in deze pagina. Groeit het aanbod naar vijftig woningen, dan
   verandert hier niets: de sectie toont de eerste zes en verwijst door. */
export default async function WadWeidsHome() {
  const properties = await myTourist.listProperties();
  return (
    <>
      <SiteHeader variant="over" />
      <HomeContent properties={properties} />
      <SiteFooter />
    </>
  );
}
