import React from 'react';
import { Helmet } from 'react-helmet-async';

interface Props {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

const SEO: React.FC<Props> = ({
    title = 'Ealing Exchange | Best Currency Exchange Rates in West London',
    description = 'Get the best exchange rates on travel money in Ealing. 0% commission, reserve online, collect in-store at West Ealing or Hanwell. Compare rates now!',
    keywords = 'currency exchange, travel money, buy euros, buy dollars, ealing exchange, west ealing, hanwell, best rates london, 0 commission',
    image = '/og-image.png',
    url = 'https://www.ealingexchange.co.uk'
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
        </Helmet>
    );
};

export default SEO;
