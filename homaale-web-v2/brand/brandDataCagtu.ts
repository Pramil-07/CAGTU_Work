export interface BrandData {
    name: string;
    smallName:string
    logoWhite: string;
    radius:number,
    logoDark:string;
    darkIcon: string;
    WhiteIcon:string;
    favicon: string;
    aiIcon: string;
    tagline: string;
    socialIcons: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
    };
    assets: {
      heroImage: string;
      footerLogo: string;
      downloadSection:string
      postTaskSection:string;
      rewardPointSection:string
      rewardSection:string

    };
    metaData:{
      title: string,
    description: string,
    keywords: string,
    ogUrl:string,
    ogImage: string

    }
  }

  export const cagtuBrand: BrandData = {
    name: 'Cagtu',
    smallName: "cagtu",
    logoWhite: '/images/logo/dark_cagtu_icon.svg',
    WhiteIcon: '/images/logo/cagtu-logo.svg',
    darkIcon: "",
      aiIcon: "images/logo/cagtuAi.png",
    favicon: '/favicon/cagtu-Collapsed.webp',
    tagline: 'Empowering Connections',
    socialIcons: {
      facebook: '/icons/cagtu-facebook.png',
      twitter: '/icons/cagtu-twitter.png',
      instagram: '/icons/cagtu-instagram.png',
    },
    assets: {
      heroImage: '/images/cagtu-hero.jpg',
      footerLogo: '/images/logo/cagtu_logo_white_icon_blue.svg',
      downloadSection: "/images/LandingCagtuImages/mobile_phone_cagtu.svg",
      postTaskSection: "/images/LandingCagtuImages/post_a_task.svg",
      rewardPointSection: "/images/LandingCagtuImages/reward_points.svg",
      rewardSection: "images/LandingCagtuImages/reward_cagtu.svg"
    },
    logoDark: "/images/logo/cagtu-logo-icon.svg",
    metaData: {
      title: "Cagtu - Catering to Your Requirements",
      description: "Cagtu is a platform designed to provide service booking solutions to the service seekers and business opportunities to various service providing companies by bridging a gap between them. It covers a wide range of services from various industries like Accounting, Gardening, Health, Beauty, and many more.",
      keywords: "homaale,,cagtu,cag, cgtu,bgtu,bagtu, homale, homalee, hoomale, hoomaale, homaale services, airtasker, find taskers, find tasks, find services",
      ogUrl: "https://www.cagtu.com.au/",
      ogImage: "https://cipher-media-files.s3.amazonaws.com/media/cipher/user/media/cagtu.png"
    },
    radius: 0
  };
