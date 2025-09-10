// Scam detection data for Southeast Asia admin dashboard - copied from Python DynamoDB data

import { processScamData } from "@/lib/scamDataProcessor";

export interface ScamDetection {
  id: string;
  detection_id: string;
  content_type: "website" | "email" | "socialmedia";
  risk_level: "Low" | "Medium" | "High";
  detected_language: string; // The actual language of the scam content (base_language)
  url?: string;
  domain?: string;
  platform?: string;
  post_url?: string;
  images?: Array<{ s3_url: string; s3_key: string }>;
  analysis: string;
  recommended_action: string;
  created_at: string;
}

export interface ScamStats {
  totalDetections: number;
  highRiskDetections: number;
  websiteScams: number;
  emailScams: number;
  socialMediaScams: number;
  topDetectedLanguages: { language: string; count: number }[];
  riskDistribution: { risk: string; count: number; percentage: number }[];
}

export interface LanguageInsight {
  language: string;
  languageCode: string;
  detections: number;
  highRisk: number;
  topContentTypes: Array<{ type: string; count: number }>;
  trend: "up" | "down" | "stable";
  trendPercentage: string;
}

export interface ThreatTrend {
  date: string;
  websites: number;
  emails: number;
  socialMedia: number;
  total: number;
}

export interface DashboardData {
  stats: ScamStats;
  recentDetections: ScamDetection[];
  websiteDetections: ScamDetection[];
  emailDetections: ScamDetection[];
  socialMediaDetections: ScamDetection[];
  languageInsights: LanguageInsight[];
  threatTrends: ThreatTrend[];
  topDomains: { domain: string; count: number; riskLevel: string }[];
}

// Raw DynamoDB data (converted from Python format)
const rawDynamoDbData = [
  {
    created_at: "2025-09-07T06:58:24.765177",
    content_type: "website",
    target_language: "zh",
    timestamp: "2025-09-07T06:58:24.765060",
    "mai-scam": "896588eeb859d3f3",
    ttl: 1765004304,
    analysis_result: {
      legitimate_url: "https://shopee.com.my/",
      risk_level: "High",
      analysis:
        "该网站模拟了Shopee电商平台，但域名不正确，并且明确声明本身是黑客马拉松演示网站，存在欺诈风险。 网站显示虚假折扣和商品价格，试图诱骗用户。",
      detected_language: "ms",
      recommended_action:
        "立即关闭此网站，访问Shopee官方网站：https://shopee.com.my/。切勿在此网站上输入任何个人信息。举报此钓鱼网站给相关部门。",
    },
    detection_id: "13602d90-7077-48c4-a879-5bdfbd5dc1aa",
    extracted_data: {
      checker_results: {
        extraction: {
          emails: [],
          phone_numbers: ["162345678901"],
          urls: ["https://shoppe123.vercel.app"],
        },
        validation: {
          phone_numbers: {
            invalid_phones: 0,
            total_phones: 2,
            valid_phones: 0,
            results: [
              {
                error: "API returned status 500",
                phone: "162345678901",
                is_valid: null,
                confidence: "unknown",
              },
              {
                error: "API returned status 500",
                phone: "913900",
                is_valid: null,
                confidence: "unknown",
              },
            ],
          },
          urls: {
            phishing_detected: 0,
            results: [
              {
                message: "URL not found in PhishTank database",
                url: "https://shoppe123.vercel.app",
                is_phishing: false,
                confidence: "unknown",
              },
            ],
            total_urls: 1,
          },
        },
      },
      metadata: {
        security: {
          hasHSTS: false,
          hasCSP: false,
          hasXSSProtection: false,
          hasXFrameOptions: false,
        },
        technical: { charset: "utf-8", language: "en" },
        favicon: "https://shoppe123.vercel.app/favicon.ico",
        social: {},
        domain: "shoppe123.vercel.app",
        description:
          "Mock e-commerce website for hackathon demonstration by team mAIscam",
        links: {
          suspiciousLinks: [],
          externalLinksCount: 0,
          socialMediaLinks: [],
        },
        seo: { viewport: "width=device-width, initial-scale=1" },
        ssl: { isSecure: true, protocol: "https:" },
      },
      signals: {
        metadata: {
          security: {
            hasHSTS: false,
            hasCSP: false,
            hasXSSProtection: false,
            hasXFrameOptions: false,
          },
          technical: { charset: "utf-8", language: "en" },
          favicon: "https://shoppe123.vercel.app/favicon.ico",
          social: {},
          domain: "shoppe123.vercel.app",
          description:
            "Mock e-commerce website for hackathon demonstration by team mAIscam",
          links: {
            suspiciousLinks: [],
            externalLinksCount: 0,
            socialMediaLinks: [],
          },
          seo: { viewport: "width=device-width, initial-scale=1" },
          ssl: { isSecure: true, protocol: "https:" },
        },
        heuristics: {
          email_count: 0,
          security: false,
          phone_count: 2,
          urgency: true,
          financial: true,
          link_count: 0,
          subscription: false,
          authentication: true,
        },
        form_indicators: {
          has_password_field: false,
          has_email_field: false,
          has_input_fields: false,
        },
        checker_analysis:
          "✓ URL Analysis: 1 URLs checked, none identified as phishing\n✓ Phone Analysis: 2 phone numbers validated",
        domain_analysis: {
          path: "/",
          has_shortened: false,
          scheme: "https",
          full_domain: "shoppe123.vercel.app",
          query: "",
          sld: "vercel",
          is_lookalike: false,
          tld: "app",
          has_suspicious_tld: false,
        },
        content_analysis: {
          title: "Shoppe123 - Mock E-Commerce Demo",
          content_length: 1793,
          has_screenshot: false,
        },
        suspicious_patterns: {
          random_subdomain: true,
          suspicious_path: false,
          multiple_hyphens: false,
          numbers_in_domain: true,
        },
        artifacts: {
          emails: [],
          phone_numbers: ["9-13900", "162345678901"],
          urls: [],
        },
        ssl_security: {
          has_ssl: false,
          domain_age_days: 0,
          ssl_expired: false,
          is_new_domain: true,
        },
      },
    },
    title: "Shoppe123 - Mock E-Commerce Demo",
    url: "https://shoppe123.vercel.app/",
    content:
      "⚠️ Please use this website for the scam extension demo purpose. This website is for hackathon demonstration purposes only by team mAIscam - Not a real scam e-commerce site ### FLASH SALE GILA! Diskaun Hingga 90% - Terhad Masa Sahaja! Berakhir dalam: 02 JAM 43 MINIT 04 SAAT 100% Original Free Shipping Secure Payment 24/7 Support ### Tawaran Terhebat Hari Ini Lihat Semua > 📱 - 86% BEST SELLER ### iPhone 16 Pro Max 512GB ( 4.9 ) RM 999 RM 7,199 12.3k sold Free Shipping 🎮 - 74% LIMITED STOCK ### PlayStation 5 Console ( 4.8 ) RM 599 RM 2,299 8.7k sold Free Shipping 👜 - 91% TRENDING ### Coach Leather Handbag Original ( 5 ) RM 299 RM 3,500 15.2k sold Free Shipping 🖥️ - 81% HOT DEAL ### Gaming PC RTX 4090 i9-13900K ( 4.9 ) RM 2,999 RM 15,999 3.1k sold Free Shipping 👟 - 85% ALMOST GONE ### Nike Air Jordan Limited Edition ( 4.7 ) RM 199 RM 1,299 9.8k sold Free Shipping 🎤 - 89% FAN FAVORITE ### BTS Official Merch Box Set ( 5 ) RM 99 RM 899 20.5k sold Free Shipping ### Ulasan Pelanggan (10,234 reviews) Ahmad B. Terbaik! Barang original dan murah gila! Siti N. Fast delivery! Sangat puas hati 😍 John L. Best deal ever! Highly recommended! Farah M. Alhamdulillah, produk sampai dengan selamat David T. Super happy with my purchase! 💯 Nurul A. Trusted seller! Will buy again ### Pembelian Terkini LIVE Tan*** baru sahaja membeli Nike Air Jordan • Petaling Jaya 12 minit lalu Lim*** membeli PS5 Console Penang • 5 minit lalu Raj*** membeli Gaming PC RTX 4090 Johor Bahru • 7 minit lalu May*** membeli Coach Handbag Shah Alam • 10 minit lalu Tan*** membeli Nike Air Jordan Petaling Jaya • 12 minit lalu ### Cara Pembayaran FPX Touch n Go GrabPay Bank Transfer *Untuk pemprosesan lebih cepat, sila transfer terus ke akaun bank kami: Maybank 162345678901 🛡️ ### mAIscam Alert Analyzing website...",
  },
  {
    created_at: "2025-09-07T06:59:05.154062",
    content_type: "socialmedia",
    target_language: "zh",
    timestamp: "2025-09-07T06:59:05.153970",
    "mai-scam": "63f90c9086563d51",
    ttl: 1765004345,
    analysis_result: {
      risk_level: "Critical",
      text_analysis:
        '帖子使用了传奇和赢钱等诱人词汇，营造紧迫感，诱导用户立即行动。它承诺非凡的回报，这通常是金融诈骗的标志。(Tiězi shǐyòngle "chuánqí" hé "yíng qián" děng yòurén cíhuì, yíngzào jǐnpògǎn, yòudǎo yònghù lìjí xíngdòng. Tā chéngnuò fēifán de huíbào, zhè tōngcháng shì jīnróng zhàpiàn de biāozhì.)',
      analysis:
        '该帖子利用名人代言形象诱导用户参与博彩活动，并且承诺传奇刺激和赢钱，这是典型的在线赌博诈骗陷阱。该帖子的目的可能是窃取用户个人信息或资金。(Gāi tiězi lìyòng míngrén dàiyǎn xíngxiàng yòudǎo yònghù cānyù bócǎi huódòng, bìngqiě chéngnuò "chuánqí cìjī" hé "yíng qián", zhè shì diǎnxíng de zàixiàn dǔbóu zhàpiàn xiànjǐng. Gāi tiězi de mùdì kěnéng shì qiēqǔ yònghù gèrén xìnxī huò zījīn.)',
      image_analysis:
        "图像中展示了不同领域的名人（篮球运动员、摩托车手），旨在营造信任感，但与BK8品牌的相关性存疑。该图像设计专业，但其目的在于欺骗用户参与危险的博彩活动。(Túxiàng zhōng zhǎnshìle bùtóng lǐngyù de míngrén (lánqiú yùndòngyuán, mòtuōchē shǒu), zhǐ zài yíngzào xìnrèngǎn, dàn yǔ BK8 pǐnpái de xiāngguānxìng cún yí. Gāi túxiàng shèjì zhuānyè, dàn qí mùdì zài qīpiàn yònghù cānyù wēixiǎn de bócǎi huódòng.)",
      detected_language: "ms",
      recommended_action:
        "立即阻止此账户，向 Facebook 报告，切勿点击链接或提供任何个人信息或资金。(Lìjí zǔzhǐ cǐ zhànghù, xiàng Facebook bàogào, qièwù diǎnjī liànjiē huò tígōng rènhé gèrén xìnxī huò zījīn.)",
    },
    detection_id: "c40c958d-591b-4591-81ad-545b84b5e8a1",
    extracted_data: {
      checker_results: {
        extraction: {
          emails: [],
          phone_numbers: ["196332293525560", "642693988889386"],
          urls: [
            "https://www.facebook.com/photo/?fbid=642693988889386&set=a.196332293525560&__cft__[0]=AZX5j_H5B7zv6ow2jJz7h7swkzWBQP6nS4xb6RF2Q7W9JoeUE3M1nYqlh4pJRfOLnJkIlUbvgnTzI4QrZnQ1pFCSJc4dNS-JpkGzwLp1EBDdQ9KsARp5EYCWi3XExOOslA1L31s43vP2T_diSNc34tj_NKI6_sqrRNIVVGo9tulSTazh6gLA9LPgJ96RVU2848o&__tn__=EH-R",
          ],
        },
        validation: {
          phone_numbers: {
            invalid_phones: 0,
            total_phones: 2,
            valid_phones: 0,
            results: [
              {
                error: "API returned status 500",
                phone: "196332293525560",
                is_valid: null,
                confidence: "unknown",
              },
              {
                error: "API returned status 500",
                phone: "642693988889386",
                is_valid: null,
                confidence: "unknown",
              },
            ],
          },
          urls: {
            phishing_detected: 0,
            results: [
              {
                message: "URL not found in PhishTank database",
                url: "https://www.facebook.com/photo/?fbid=642693988889386&set=a.196332293525560&__cft__[0]=AZX5j_H5B7zv6ow2jJz7h7swkzWBQP6nS4xb6RF2Q7W9JoeUE3M1nYqlh4pJRfOLnJkIlUbvgnTzI4QrZnQ1pFCSJc4dNS-JpkGzwLp1EBDdQ9KsARp5EYCWi3XExOOslA1L31s43vP2T_diSNc34tj_NKI6_sqrRNIVVGo9tulSTazh6gLA9LPgJ96RVU2848o&__tn__=EH-R",
                is_phishing: false,
                confidence: "unknown",
              },
            ],
            total_urls: 1,
          },
        },
      },
      images: [
        {
          s3_url:
            "https://mai-scam-detected-images.s3.amazonaws.com/social_media/20250907/63f90c9086563d51_image_0.jpg",
          s3_key: "social_media/63f90c9086563d51_image_0.jpg",
          original_data: "base64_encoded_image",
          uploaded_at: "2025-09-06T16:36:00.000Z",
          file_size: 364343,
        },
      ],
      signals: {
        heuristics: {
          trending: false,
          offers: false,
          engagement: false,
          has_shortened_link: false,
          financial: false,
          link_count: 0,
          hashtag_count: 4,
          mention_count: 0,
          has_suspicious_tld: false,
        },
        engagement_metrics: {
          shares: 0,
          reactions: 0,
          comments: 0,
          likes: 0,
        },
        engagement_signals: {},
        platform_risks: { fake_giveaway: false, impersonation: false },
        checker_analysis:
          "✓ URL Analysis: 1 URLs checked, none identified as phishing\n✓ Phone Analysis: 2 phone numbers validated",
        artifacts: {
          url_domains: [],
          phone_numbers: [],
          urls: [],
          hashtags: [
            "#BK8Philippines",
            "#BiggestAndMostTrusted",
            "#HaveYouBK8",
            "#LegendaryPlay",
          ],
          mentions: [],
        },
        platform_meta: {
          author_followers_count: null,
          post_url:
            "https://www.facebook.com/photo/?fbid=642693988889386&set=a.196332293525560&__cft__[0]=AZX5j_H5B7zv6ow2jJz7h7swkzWBQP6nS4xb6RF2Q7W9JoeUE3M1nYqlh4pJRfOLnJkIlUbvgnTzI4QrZnQ1pFCSJc4dNS-JpkGzwLp1EBDdQ9KsARp5EYCWi3XExOOslA1L31s43vP2T_diSNc34tj_NKI6_sqrRNIVVGo9tulSTazh6gLA9LPgJ96RVU2848o&__tn__=EH-R",
          author_username: "BK8 Philippines",
          platform: "facebook",
        },
      },
    },
    post_url:
      "https://www.facebook.com/photo/?fbid=642693988889386&set=a.196332293525560&__cft__[0]=AZX5j_H5B7zv6ow2jJz7h7swkzWBQP6nS4xb6RF2Q7W9JoeUE3M1nYqlh4pJRfOLnJkIlUbvgnTzI4QrZnQ1pFCSJc4dNS-JpkGzwLp1EBDdQ9KsARp5EYCWi3XExOOslA1L31s43vP2T_diSNc34tj_NKI6_sqrRNIVVGo9tulSTazh6gLA9LPgJ96RVU2848o&__tn__=EH-R",
    engagement_metrics: {
      shares: 0,
      reactions: 0,
      comments: 0,
      likes: 0,
    },
    multimodal: true,
    author_followers_count: 0,
    author_username: "BK8 Philippines",
    version: "v2",
    platform: "facebook",
    content:
      "Ambassadors choose us. Champions trust us. Legends represent us.Ngayon, ikaw naman!  Sulitin ang chance to play, win, and feel the LEGENDARY thrill! Don't miss out — sumali na at maging parte ng panalo!Link in bio#BK8Philippines #BiggestAndMostTrusted #HaveYouBK8 #LegendaryPlay",
  },
  {
    created_at: "2025-09-07T06:57:58.439514",
    content_type: "website",
    target_language: "zh",
    timestamp: "2025-09-07T06:57:58.439393",
    "mai-scam": "9f4b1e3da854e8f3",
    ttl: 1765004278,
    analysis_result: {
      legitimate_url: null,
      risk_level: "Medium",
      analysis:
        "该网站声称是亚洲最佳在线赌场，并赞助多个体育赛事，但域名注册时间短，且包含数字和随机子域名，存在潜在风险。",
      detected_language: "zh",
      recommended_action:
        "在使用此网站前，请仔细核实其真实性。如果您想参与在线赌场游戏，请通过官方渠道寻找信誉良好的平台。",
    },
    detection_id: "393ea77b-1f89-4c6d-b8a7-cf83851e880e",
    extracted_data: {
      checker_results: {
        extraction: {
          emails: [],
          phone_numbers: [],
          urls: ["https://www.bk8sgasia.com/en-sg/home"],
        },
        validation: {
          urls: {
            phishing_detected: 0,
            results: [
              {
                message: "URL not found in PhishTank database",
                url: "https://www.bk8sgasia.com/en-sg/home",
                is_phishing: false,
                confidence: "unknown",
              },
            ],
            total_urls: 1,
          },
        },
      },
      metadata: {
        security: {
          hasHSTS: false,
          hasCSP: false,
          hasXSSProtection: false,
          hasXFrameOptions: false,
        },
        keywords: "BK8",
        technical: { charset: "utf-8", language: "en" },
        favicon: "https://www.bk8sgasia.com/favicon.ico?v=1",
        social: { ogImage: "/public/html/logo/img_logo_150.png" },
        domain: "www.bk8sgasia.com",
        description:
          "BK8 is a trusted online casino Asia site that offer variety of casino games like live casino, online slots, sports betting. Register and play now!",
        links: {
          suspiciousLinks: [],
          externalLinksCount: 2,
          socialMediaLinks: [],
        },
        seo: {
          viewport: "initial-scale=1.0, user-scalable=no, width=device-width",
          canonical: "https://www.bk8sgasia.com/en-sg/home",
          robots: "index, follow",
        },
        ssl: { isSecure: true, protocol: "https:" },
      },
      signals: {
        metadata: {
          security: {
            hasHSTS: false,
            hasCSP: false,
            hasXSSProtection: false,
            hasXFrameOptions: false,
          },
          keywords: "BK8",
          technical: { charset: "utf-8", language: "en" },
          favicon: "https://www.bk8sgasia.com/favicon.ico?v=1",
          social: { ogImage: "/public/html/logo/img_logo_150.png" },
          domain: "www.bk8sgasia.com",
          description:
            "BK8 is a trusted online casino Asia site that offer variety of casino games like live casino, online slots, sports betting. Register and play now!",
          links: {
            suspiciousLinks: [],
            externalLinksCount: 2,
            socialMediaLinks: [],
          },
          seo: {
            viewport: "initial-scale=1.0, user-scalable=no, width=device-width",
            canonical: "https://www.bk8sgasia.com/en-sg/home",
            robots: "index, follow",
          },
          ssl: { isSecure: true, protocol: "https:" },
        },
        heuristics: {
          email_count: 0,
          security: false,
          phone_count: 0,
          urgency: false,
          financial: false,
          link_count: 0,
          subscription: false,
          authentication: true,
        },
        form_indicators: {
          has_password_field: false,
          has_email_field: false,
          has_input_fields: false,
        },
        checker_analysis:
          "✓ URL Analysis: 1 URLs checked, none identified as phishing",
        domain_analysis: {
          path: "/en-sg/home",
          has_shortened: false,
          scheme: "https",
          full_domain: "www.bk8sgasia.com",
          query: "",
          sld: "bk8sgasia",
          is_lookalike: false,
          tld: "com",
          has_suspicious_tld: false,
        },
        content_analysis: {
          title: "BK8 | The Best Online Casino Asia | Trusted Casino Site 2025",
          content_length: 2526,
          has_screenshot: false,
        },
        suspicious_patterns: {
          random_subdomain: true,
          suspicious_path: false,
          multiple_hyphens: false,
          numbers_in_domain: true,
        },
        artifacts: { emails: [], phone_numbers: [], urls: [] },
        ssl_security: {
          has_ssl: false,
          domain_age_days: 0,
          ssl_expired: false,
          is_new_domain: true,
        },
      },
    },
    title: "BK8 | The Best Online Casino Asia | Trusted Casino Site 2025",
    url: "https://www.bk8sgasia.com/en-sg/home",
    content:
      "News more Upcoming LIVE Matches Official Sponsor of BWF Major Championships 2025/26 BK8 Gresini Racing MotoGP 2025 Official Partner I Burnley F.C. Official Sponsor of BWF Major Championships 2025/26 BK8 Gresini Racing MotoGP 2025 Official Partner I Burnley F.C. Official Sponsor of BWF Major Championships 2025/26 Australia - NPL New South Wales 07/09 - 3:00pm * Odds may change without prior notice • H NWS Spirit FC A Rockdale Ilinden • • 0 HDP 0 1.92 Odds 1.92 Japan - Div 1 Women 07/09 - 3:00pm * Odds may change without prior notice • H Setagaya Sfida FC [W] A IGA Kunoichi [W] • • 0.25 HDP -0.25 1.75 Odds 2.03 Japan - Div 1 Women 07/09 - 3:00pm * Odds may change without prior notice • H Shizuoka SSU Asregina [W] A Okayama Yunogo Belle [W] • • -0.25 HDP 0.25 1.94 Odds 1.84 Japan - Regional League 07/09 - 3:00pm * Odds may change without prior notice • H International Pacific University SC A ENEOS Mizushima • • -2 HDP 2 1.83 Odds 1.93 Hong Kong - 1st Division 07/09 - 3:30pm * Odds may change without prior notice • H Yuen Long FC A Shatin • • 0 HDP 0 1.93 Odds 1.75 Hong Kong - 1st Division 07/09 - 3:30pm * Odds may change without prior notice • H Resources Capital A Sham Shui Po • • -0.25 HDP 0.25 1.84 Odds 1.84 Hong Kong - 2nd Division 07/09 - 3:30pm * Odds may change without prior notice • H Tuen Mun SA A Wong Tai Sin • • -0.75 HDP 0.75 1.90 Odds 1.78 Hong Kong - 2nd Division 07/09 - 3:30pm * Odds may change without prior notice • H Yau Tsim Mong A New Fair Kui Tan • • 1.75 HDP -1.75 1.77 Odds 1.91 Hong Kong - 2nd Division 07/09 - 3:30pm * Odds may change without prior notice • H Sui Tung A Fu Moon • • -0.5 HDP 0.5 1.89 Odds 1.79 Hong Kong - 3rd Division 07/09 - 3:30pm * Odds may change without prior notice • H Tsun Tat Kwok Keung A Ornament • • -0.5 HDP 0.5 1.78 Odds 1.90 ### Welcome to BK8 Online Casino Asia How to Register Click Join Now. Fill in your login info Make your first deposit using money or crypto transfer Start winning while playing on your favourite games Don't forget to claim your bonuses Create account Make a deposit Start winning Get reward Popular Games We Love See all BK8 Candy Bonanza Hot Nextspin RTP 96.72 BK8 Candy Bonanza Xmas Hot Nextspin RTP 97.93 BK8 Roma Hot Nextspin RTP 96.75 Pac Man Glory Hot Nextspin RTP 96.95 Mahjong Phoenix Hot Nextspin RTP 96.94 Golden West Hot Nextspin RTP 96.99 Buffalo King Hot Nextspin RTP 96.7 Cleopetra Fortune Hot Nextspin RTP 96.97 BK8 Gates of Olympus 1000 Hot Pragmatic Play RTP 96.\n\n[Content truncated for analysis efficiency]",
  },
  {
    created_at: "2025-09-07T06:57:37.544023",
    content_type: "email",
    target_language: "zh",
    timestamp: "2025-09-07T06:57:37.543988",
    "mai-scam": "aaf7fe6f3f924937",
    ttl: 1765004257,
    analysis_result: {
      risk_level: "High",
      analysis:
        "此邮件声称您的银行账户已被锁定，并要求您点击链接进行验证。该链接指向一个可疑域名（bankn3gara.xyz），与马来西亚国家银行的官方网站不符，属于网络钓鱼攻击。",
      detected_language: "ms",
      recommended_action:
        "删除此电子邮件并报告为网络钓鱼。切勿点击链接或提供任何个人信息。通过马来西亚国家银行的官方网站或电话联系他们以验证账户状态。",
    },
    detection_id: "9d5221ec-18b7-499f-bd6f-a9fe9ecb554d",
  },
];

// Export the processed data using the utility function
export const dummyDashboardData: DashboardData =
  processScamData(rawDynamoDbData);

// Helper function to get dummy data with simulated delay
export const getDummyData = async (): Promise<DashboardData> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return dummyDashboardData;
};
