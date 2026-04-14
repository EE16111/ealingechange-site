import React from 'react';
import { Helmet } from 'react-helmet-async';

interface Props {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "CurrencyExchange",
    "name": "Ealing Exchange",
    "description": "Best currency exchange rates in West London. 0% commission on all exchanges.",
    "url": "https://ealingexchange.co.uk",
    "telephone": "+442088406420",
    "email": "info@ealingexchange.co.uk",
    "priceRange": "$$",
    "image": "https://ealingexchange.co.uk/og-image.png",
    "address": [
        {
            "@type": "PostalAddress",
            "streetAddress": "16 The Broadway, West Ealing",
            "addressLocality": "London",
            "postalCode": "W13 0SR",
            "addressCountry": "GB"
        },
        {
            "@type": "PostalAddress",
            "streetAddress": "111 Uxbridge Rd, Hanwell",
            "addressLocality": "London",
            "postalCode": "W7 3ST",
            "addressCountry": "GB"
        }
    ],
    "openingHours": "Mo-Sa 09:00-18:00",
    "sameAs": []
};

const SEO: React.FC<Props> = ({
    title = 'Ealing Exchange | Best Currency Exchange Rates in West London',
    description = 'Get the best exchange rates on travel money in Ealing. 0% commission, reserve online, collect in-store at West Ealing or Hanwell. Compare rates now!',
    keywords = 'currency exchange, travel money, buy euros, buy dollars, ealing exchange, west ealing, hanwell, best rates london, 0 commission',
    image = '/og-image.png',
    url = 'https://ealingexchange.co.uk'
}) => {
    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            {/* Canonical */}
            <link rel="canonical" href={url} />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(localBusinessSchema)}
            </script>
        </Helmet>
    );
};

export default SEO;

