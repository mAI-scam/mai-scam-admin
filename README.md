# 🛡️ Mai Scam Admin Dashboard

A comprehensive admin dashboard for monitoring and analyzing cyber threat detections across Southeast Asia. This dashboard provides real-time insights into scam activities, language-based threat analysis, and high-risk content management.

## 🌟 Features

### 📊 **Detection Log**

- **Comprehensive monitoring**: View all scam detections with built-in filtering capabilities
- **Real-time data**: Live updates from AWS DynamoDB for Google-authenticated users
- **Advanced filtering**: Filter by content type (website, email, social media), risk level, and language
- **Pagination support**: Efficiently browse through large datasets with server-side pagination
- **Detailed analysis**: Click on any detection to view in-depth analysis and threat assessment

### 🌐 **Language Insights**

- **Threat trend analysis**: Weighted scoring system (1-3 scale) to identify cyber threat patterns across languages
- **Risk assessment**: Sophisticated algorithm considering high, medium, and low-risk detection distributions
- **Visual analytics**: Interactive charts showing risk level distributions and threat patterns
- **Country mapping**: Geographic insights into threat origins and language correlations

### 🚫 **Blacklist Management**

- **High-risk URLs**: Comprehensive list of detected malicious websites with detection counts
- **Social media monitoring**: Visual carousel of high-risk social media posts and images
- **Automated updates**: Real-time blacklist updates based on threat detection algorithms
- **Risk prioritization**: URLs and content sorted by threat level and detection frequency

## 🚀 Quick Start

### Option 1: Live Data Access (Recommended)

1. **Sign in with Google** to access real-time data from AWS DynamoDB
2. **No setup required** - instant access to live threat detection data
3. **Full functionality** - all features available with current threat intelligence

### Option 2: Test Data Access

1. **Use test credentials**:
   - **Username**: `test`
   - **Password**: `1234`
2. **View sample data** from pre-configured datasets
3. **Perfect for demos** and testing dashboard functionality

## 🔧 Technical Architecture

### **Authentication System**

- **Google OAuth**: Secure authentication via Supabase
- **Test Mode**: Local authentication for development and demos
- **Session Management**: Persistent login with automatic token refresh

### **Data Sources**

- **Live Data**: AWS DynamoDB with real-time scam detection records
- **Test Data**: Pre-configured sample datasets for development
- **Image Storage**: AWS S3 integration for social media content analysis

### **Technology Stack**

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: AWS DynamoDB for real-time data
- **Storage**: AWS S3 for image and content storage
- **Charts**: Chart.js for data visualization

## 📈 Dashboard Sections

### **Overview**

- **Summary statistics**: Total detections, risk distribution, and trend analysis
- **Quick insights**: Key metrics and recent activity highlights
- **Navigation hub**: Easy access to all dashboard sections

### **Detection Log**

- **Comprehensive list**: All detections with filtering and sorting capabilities
- **Risk categorization**: High, medium, and low-risk classification
- **Content type filtering**: Website, email, and social media detections
- **Language filtering**: Multi-language support with country mapping
- **Pagination**: Efficient browsing through large datasets

### **Language Insights**

- **Threat scoring**: Weighted algorithm (High=3, Medium=2, Low=1 points)
- **Risk thresholds**:
  - High Risk: Score ≥ 2.2
  - Medium Risk: Score 1.8 - 2.1
  - Low Risk: Score < 1.8
- **Visual analytics**: Interactive bar charts and risk distribution graphs
- **Country correlation**: Geographic insights into threat patterns

### **Blacklist**

- **URL management**: High-risk website URLs with detection counts
- **Image carousel**: Automated rotation of high-risk social media content
- **Risk prioritization**: Content sorted by threat level and frequency
- **Real-time updates**: Live blacklist updates based on new detections

## 🔐 Security Features

- **Secure authentication**: Google OAuth with Supabase
- **Role-based access**: Admin-level security for sensitive data
- **Data encryption**: Secure transmission and storage of threat intelligence
- **Session management**: Automatic logout and token refresh

## 🌍 Geographic Coverage

- **Southeast Asia focus**: Specialized threat detection for regional patterns
- **Multi-language support**: Detection and analysis across multiple languages
- **Country mapping**: Geographic correlation of threat origins
- **Regional insights**: Tailored analysis for Southeast Asian cyber threats

## 🚀 Getting Started

1. **Visit the dashboard** at your deployed URL
2. **Choose authentication method**:
   - Click "Google Auth" for live data access
   - Use test credentials for demo purposes
3. **Explore the sections**:
   - Start with Overview for general insights
   - Dive into Detection Log for detailed analysis
   - Check Language Insights for threat patterns
   - Review Blacklist for high-risk content
4. **Use filtering options** to focus on specific threat types or languages

## 🔄 Data Updates

- **Real-time sync**: Live data updates from AWS DynamoDB
- **Automatic refresh**: Dashboard updates without manual intervention
- **Pagination support**: Efficient handling of large datasets
- **Error handling**: Graceful fallback to test data if live data unavailable

## 📊 Key Metrics

- **Detection counts**: Total and categorized threat detections
- **Risk distribution**: High, medium, and low-risk percentages
- **Language analysis**: Threat patterns across different languages
- **Geographic insights**: Country-based threat correlation
- **Temporal trends**: Time-based threat pattern analysis

## 🛠️ Development

For developers and contributors:

- **Environment setup**: Configure AWS credentials for live data access
- **Local development**: Use test credentials for development
- **API endpoints**: RESTful APIs for data access and management
- **Component architecture**: Modular React components with TypeScript

## 📞 Support

For technical support or questions about the dashboard:

- **Documentation**: Comprehensive setup guides and API documentation
- **Test mode**: Use test credentials for troubleshooting
- **Live data**: Google authentication for production access

---

**© 2024 Mai Scam Admin Dashboard** - Protecting Southeast Asia from cyber threats through intelligent monitoring and analysis.
