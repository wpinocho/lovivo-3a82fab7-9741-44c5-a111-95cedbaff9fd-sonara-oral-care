import { HeadlessIndex } from '@/components/headless/HeadlessIndex';
import { IndexUI } from '@/pages/ui/IndexUI';
import { SEO } from '@/components/SEO';
import { useSettings } from '@/contexts/SettingsContext';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';

const Index = () => {
  const { storeName, socialLinks } = useSettings();
  return (
    <>
      <SEO
        title={storeName}
        description={`Tienda online de ${storeName}. Descubre nuestros productos con envíos a todo el país.`}
        canonicalPath="/"
        jsonLd={[organizationJsonLd(storeName, socialLinks), websiteJsonLd(storeName)]}
      />
      <HeadlessIndex>
        {(logic) => <IndexUI logic={logic} />}
      </HeadlessIndex>
    </>
  );
};

export default Index;