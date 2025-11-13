// src/pages/StudentApplications.jsx
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import Footer from "./Footer";
import { API_BASE_URL } from "../../config";

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        console.log("🔄 Fetching applications from:", `${API_BASE_URL}/api/applications`);
        
        const response = await fetch(`${API_BASE_URL}/api/applications`);
        console.log("📥 Response status:", response.status);
        
        const data = await response.json();
        console.log("📥 Full API response:", data);
        
        // ✅ FIXED: Correct data structure
        const apps = data.data || [];
        console.log("✅ Applications found:", apps.length);
        console.log("📋 Applications details:", apps);
        
        setApplications(apps);
      } catch (err) {
        console.error("❌ Error fetching applications:", err);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // 3 days countdown calculator - FIXED
  const getCountdown = (approvedAt) => {
    if (!approvedAt) return 0;
    
    try {
      const approvedDate = new Date(approvedAt);
      const now = new Date();
      
      // Add 3 days to approved date
      const expiryDate = new Date(approvedDate);
      expiryDate.setDate(expiryDate.getDate() + 3);
      
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      console.error("Date calculation error:", error);
      return 0;
    }
  };

  const generateIDCard = async (application) => {
    // Create a hidden div for the ID card design
    const idCardElement = document.createElement("div");
    idCardElement.style.width = "85mm";
    idCardElement.style.height = "54mm";
    idCardElement.style.padding = "8px";
    idCardElement.style.border = "2px solid #1e40af";
    idCardElement.style.borderRadius = "8px";
    idCardElement.style.background = "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)";
    idCardElement.style.color = "#1e3a8a";
    idCardElement.style.fontFamily = "Arial, sans-serif";
    idCardElement.style.position = "fixed";
    idCardElement.style.left = "-1000px";
    idCardElement.style.top = "0";
    idCardElement.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";

    // Preload image to ensure it's loaded before capturing
    let photoHtml = `
      <div style="width: 75px; height: 75px; background: #e5e7eb; border: 2px solid #1e40af; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 9px; font-weight: bold; margin: 0 auto;">
        PHOTO
      </div>
    `;
    
    if (application.photo) {
      try {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          // ✅ FIXED: Correct image path
          img.src = `${API_BASE_URL}/uploads/${application.photo}`;
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
        photoHtml = `
          <img src="${API_BASE_URL}/uploads/${application.photo}" 
               alt="Photo" 
               style="width: 75px; height: 75px; object-fit: cover; border: 2px solid #1e40af; border-radius: 5px; margin: 0 auto;" />
        `;
      } catch (error) {
        console.error("Error loading image:", error);
      }
    }

    // Format program name for display
    const formatProgram = (program) => {
      const programMap = {
        'CSE': 'B.Sc. Engg. in CSE',
        'EEE': 'B.Sc. Engg. in EEE', 
        'BBA': 'Bachelor of Business Administration',
        'English': 'BA in English',
        'Law': 'LLB',
        'computer-science': 'B.Sc. Engg. in CSE',
        'business': 'BBA',
        'engineering': 'B.Sc. Engineering',
        'arts': 'BA',
        'medicine': 'MBBS'
      };
      return programMap[program] || program;
    };

    // Determine if student or staff
    const userType = application.cardType === 'student' ? 'Student' : 
                    application.cardType === 'staff' ? 'Staff' : 'Visitor';

    idCardElement.innerHTML = `
      <!-- Header Section with Logo and University Name -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #1e40af;">
        <!-- Logo Placeholder -->
        <div style="width: 35px; height: 35px; background: #1e3a8a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; flex-shrink: 0;">
          BUBT
        </div>
        
        <!-- University Name -->
        <div style="flex-grow: 1;">
          <div style="font-size: 12px; font-weight: bold; color: #1e3a8a; line-height: 1.1;">
            Bangladesh University of<br/>
            <span style="font-size: 11px;">Business and Technology</span>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <!-- Photo Section -->
        <div style="flex-shrink: 0;">
          ${photoHtml}
          <!-- User Type (Student/Staff) -->
          <div style="text-align: center; margin-top: 3px; font-size: 9px; color: #dc2626; font-weight: bold; background: #fef2f2; padding: 2px 4px; border-radius: 3px;">
            ${userType}
          </div>
        </div>
        
        <!-- Details Section -->
        <div style="flex-grow: 1;">
          <!-- Student Name -->
          <div style="margin-bottom: 4px;">
            <div style="font-size: 12px; font-weight: bold; color: #1e3a8a; border-bottom: 1px solid #d1d5db; padding-bottom: 2px;">
              ${application.firstName} ${application.lastName}
            </div>
          </div>
          
          <!-- Program -->
          ${application.program ? `
            <div style="margin-bottom: 3px;">
              <div style="font-size: 9px; color: #374151;">
                <strong>Program:</strong> ${formatProgram(application.program)}
              </div>
            </div>
          ` : ''}
          
          <!-- Student ID -->
          <div style="margin-bottom: 3px;">
            <div style="font-size: 9px; color: #374151;">
              <strong>ID:</strong> ${application.studentId}
            </div>
          </div>
          
          <!-- Email -->
          <div style="margin-bottom: 3px;">
            <div style="font-size: 8px; color: #374151; word-break: break-all;">
              <strong>Email:</strong> ${application.email}
            </div>
          </div>
          
          <!-- Validity -->
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #d1d5db;">
            <div style="font-size: 7px; color: #dc2626; text-align: center; font-weight: bold;">
              Valid for: ${getCountdown(application.approvedAt)} days • Temporary ID
            </div>
            <div style="font-size: 6px; color: #6b7280; text-align: center; margin-top: 1px;">
              Issued: ${application.approvedAt ? new Date(application.approvedAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
      
      <!-- BUBT Footer -->
      <div style="text-align: center; margin-top: 6px; padding-top: 3px; border-top: 1px solid #d1d5db;">
        <div style="font-size: 10px; font-weight: bold; color: #1e3a8a; letter-spacing: 1px;">
          BUBT ID CARD
        </div>
      </div>
    `;

    document.body.appendChild(idCardElement);

    try {
      // Use html2canvas with better quality settings
      const canvas = await html2canvas(idCardElement, {
        scale: 4,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        width: idCardElement.offsetWidth,
        height: idCardElement.offsetHeight
      });

      // Create PDF with ID card size
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [54, 85],
        compress: true
      });

      const imgWidth = 54;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imgData = canvas.toDataURL('image/png', 1.0);

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`BUBT-ID-Card-${application.studentId}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating ID card. Please try again.");
    } finally {
      document.body.removeChild(idCardElement);
    }
  };

  const handleDownload = (application) => {
    generateIDCard(application);
  };

  // ✅ FIXED: Show ALL applications temporarily for testing
  const visibleApplications = applications; // সব applications দেখাবে

  // Later you can use this filter for only approved ones:
  // const visibleApplications = applications.filter(
  //   (app) => app.approvedAt && getCountdown(app.approvedAt) > 0
  // );

  console.log("👀 Visible applications:", visibleApplications);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <div className="flex-grow">
        <div className="container px-4 mx-auto py-8">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Your Applications</h2>
          <p className="text-center text-gray-600 mb-8">View and download your approved ID cards</p>
          
          {/* Debug Info */}
          <div className="mb-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              <strong>Applications Status:</strong> Total: {applications.length}  
          
            </p>
          </div>
          
          {visibleApplications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Applications Found</h3>
              <p className="text-gray-600 mb-6 text-lg">
                You haven't submitted any applications yet or they are pending approval.
              </p>
              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                <p className="mb-2">✅ Approved applications will appear here automatically</p>
                <p>⏳ ID cards are valid for 3 days after approval</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 max-w-6xl mx-auto">
              {visibleApplications.map((app, index) => (
                <div
                  key={app._id || app.studentId || index}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-start gap-4 flex-grow">
                      <div className="flex-shrink-0">
                        {app.photo ? (
                          <img
                            src={`${API_BASE_URL}/uploads/${app.photo}`}
                            alt="Student"
                            className="w-20 h-20 object-cover rounded-xl border-2 border-gray-300 shadow-md"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div className={`w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-300 flex items-center justify-center text-gray-500 text-sm font-medium shadow-md ${
                          app.photo ? "hidden" : "flex"
                        }`}>
                          No Photo
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 min-w-20">Name:</span>
                            <span className="text-gray-900 text-lg font-medium">{app.firstName} {app.lastName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 min-w-20">ID:</span>
                            <span className="text-gray-900 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{app.studentId}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 min-w-20">Email:</span>
                            <span className="text-gray-900 text-sm">{app.email}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {app.program && (
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-700 min-w-20">Program:</span>
                              <span className="text-gray-900 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">{app.program}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 min-w-20">Approved:</span>
                            <span className="text-gray-900 text-sm bg-green-50 px-3 py-1 rounded-full">
                              {app.approvedAt ? new Date(app.approvedAt).toLocaleDateString() : "Not Approved"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 min-w-20">Status:</span>
                            <span className={`font-bold text-lg ${
                              app.approvedAt 
                                ? (getCountdown(app.approvedAt) > 0 ? "text-green-600" : "text-red-600")
                                : "text-orange-600"
                            }`}>
                              {app.approvedAt 
                                ? (getCountdown(app.approvedAt) > 0 
                                    ? `✅ Valid (${getCountdown(app.approvedAt)} days left)` 
                                    : "❌ Expired")
                                : "⏳ Pending Approval"
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {app.approvedAt && getCountdown(app.approvedAt) > 0 ? (
                        <button
                          onClick={() => handleDownload(app)}
                          className="w-full lg:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          📥 Download ID Card
                        </button>
                      ) : (
                        <div className="text-center text-gray-500 text-sm bg-gray-100 px-4 py-3 rounded-lg">
                          {app.approvedAt ? "🕒 ID Card Expired" : "⏳ Awaiting Approval"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StudentApplications;