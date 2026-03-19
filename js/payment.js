// payment.js - Updated: Telegram moved to Apps Script
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('order-form');
    const feedbackDiv = document.getElementById('form-feedback');

    // Google Apps Script URL
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXJbnt-0TBUT_OnZIaRPima92GEt11wcRDrK-ZM7zWX1Il_6rKYFFGlSAomC7q9g1Y/exec';

    // Rate limiting
    let submissionCount = 0;
    const MAX_SUBMISSIONS = 3;
    const RATE_LIMIT_WINDOW = 60000; // 1 minute
    let lastSubmissionTime = 0;

    // Main form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Rate limiting check
        if (!checkRateLimit()) {
            showFeedback('Too many attempts. Please wait a minute.', 'error');
            return;
        }

        // Get form values
        const name = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const method = document.getElementById('method').value;
        const trxid = document.getElementById('trxid').value.trim();

        // Validation
        if (!name || !email || !method || !trxid) {
            showFeedback('Please fill all required fields.', 'error');
            return;
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) {
            showFeedback('Enter a valid email address.', 'error');
            return;
        }

        if (trxid.length < 5) {
            showFeedback('Transaction ID is too short.', 'error');
            return;
        }

        // Disable submit button
        const submitBtn = document.getElementById('submit-order');
        const originalText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = '⏳ Verifying payment...';

        try {
            showFeedback('Verifying your payment...', 'info');

            // Verify with Google Sheets (Telegram notification handled in Apps Script)
            const verificationResult = await verifyTRXID(trxid, name, email, method);

            if (verificationResult.success) {
                showFeedback('✅ Payment Successful! Generating your receipt...', 'success');

                // Generate PDF after short delay
                setTimeout(async () => {
                    try {
                        const pdfResult = await generatePDFReceipt(name, trxid);
                        if (pdfResult) {
                            console.log('PDF generated successfully');
                        } else {
                            console.warn('PDF generation failed, showing download link');
                            showDownloadLink();
                        }
                    } catch (pdfError) {
                        console.error('PDF error:', pdfError);
                        showDownloadLink();
                    }
                }, 1500);

                // Clear form after 10 seconds
                setTimeout(() => {
                    form.reset();
                }, 10000);

            } else {
                showFeedback('❌ ' + (verificationResult.message || 'Payment verification failed'), 'error');
            }

        } catch (error) {
            console.error('Verification error:', error);
            showFeedback('Connection error. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    });

    // PDF Generation Function (Unchanged)
    async function generatePDFReceipt(name, trxid) {
        try {
            if (typeof window.jspdf === 'undefined') {
                await loadJSPDFLibrary();
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFont("helvetica", "bold");
            doc.setFontSize(24);
            doc.setTextColor(0, 102, 204);
            doc.text("PAYMENT SUCCESSFUL!", 20, 25);
            
            doc.setFontSize(16);
            doc.setTextColor(0, 153, 76);
            doc.text("Transaction Completed", 20, 35);

            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            doc.text("Dear " + (name || 'Customer') + ",", 20, 50);
            
            doc.setFontSize(12);
            doc.text("Your payment has been successfully processed.", 20, 60);

            doc.setFont("helvetica", "bold");
            doc.text("Transaction Details:", 20, 80);
            
            doc.setFont("helvetica", "normal");
            doc.text("Transaction ID: " + (trxid || 'N/A'), 30, 90);
            doc.text("Product: WinMaster (Lifetime Access)", 30, 100);
            doc.text("Payment Date: " + new Date().toLocaleString(), 30, 110);
            
            doc.setFont("helvetica", "bold");
            doc.text("Download Link:", 20, 130);
            
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 255);
            const link = "https://drive.google.com/drive/folders/1iYlA1Gwqg-AuNUzmBDhil6AOmdP15N6Z";
            doc.text(link, 20, 140, { maxWidth: 170 });
            
            doc.setTextColor(255, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.text("IMPORTANT:", 20, 160);
            
            doc.setFont("helvetica", "normal");
            doc.text("Do not share this information with anyone.", 30, 170);
            doc.text("This is your personal access receipt.", 30, 180);
            
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.text("Support:", 20, 200);
            
            doc.setFont("helvetica", "normal");
            doc.text("WhatsApp: +8801853978790", 30, 210);
            doc.text("Email: support.winmaster@gmail.com", 30, 220);
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(128, 128, 128);
            const dateStr = new Date().toLocaleString('en-US', { 
                timeZone: 'Asia/Dhaka',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            doc.text(`Generated: ${dateStr} (Bangladesh Time)`, 20, 250);
            
            doc.setDrawColor(0, 102, 204);
            doc.setLineWidth(0.5);
            doc.rect(10, 10, 190, 270);

            const filename = `WinMaster_Receipt_${trxid || 'confirmed'}.pdf`;
            doc.save(filename);
            
            console.log('✅ PDF saved:', filename);
            return true;

        } catch (error) {
            console.error('PDF generation error:', error);
            return false;
        }
    }

    // Show download link as fallback (Unchanged)
    function showDownloadLink() {
        const link = "https://drive.google.com/drive/folders/1iYlA1Gwqg-AuNUzmBDhil6AOmdP15N6Z";
        showFeedback(`📥 Download Link: ${link}`, 'success');
        window.open(link, '_blank');
    }

    // Load jspdf library (Unchanged)
    async function loadJSPDFLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof window.jspdf !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                console.log('✅ jspdf loaded');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Failed to load jspdf');
                reject(new Error('Failed to load jsPDF library'));
            };
            document.head.appendChild(script);
        });
    }

    // Google Sheets verification (Updated - Telegram handled in Apps Script)
    async function verifyTRXID(trxid, name, email, method) {
        try {
            const params = new URLSearchParams({
                action: 'verify',
                trxid: trxid,
                name: name,
                email: email,
                method: method
            });
            const url = `${SCRIPT_URL}?${params.toString()}`;

            const response = await fetch(url);
            const data = await response.json();

            return {
                success: data.success !== false,
                message: data.message || 'Payment verified successfully!'
            };

        } catch (error) {
            console.error('Verification error:', error);
            return {
                success: true,
                message: 'Payment received! (Offline mode)'
            };
        }
    }

    // Rate limiting function (Unchanged)
    function checkRateLimit() {
        const now = Date.now();
        if (now - lastSubmissionTime > RATE_LIMIT_WINDOW) {
            submissionCount = 0;
            lastSubmissionTime = now;
            return true;
        }
        if (submissionCount >= MAX_SUBMISSIONS) {
            return false;
        }
        submissionCount++;
        lastSubmissionTime = now;
        return true;
    }

    // Feedback function (Unchanged)
    function showFeedback(message, type) {
        if (!feedbackDiv) return;
        
        feedbackDiv.textContent = message;
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.padding = '12px 16px';
        feedbackDiv.style.borderRadius = '8px';
        feedbackDiv.style.marginTop = '16px';
        feedbackDiv.style.fontWeight = '500';
        feedbackDiv.style.transition = 'all 0.3s ease';

        if (type === 'error') {
            feedbackDiv.style.background = '#fee9e7';
            feedbackDiv.style.color = '#b3402d';
            feedbackDiv.style.border = '1px solid #f3cdc5';
        } else if (type === 'success') {
            feedbackDiv.style.background = '#e2f7e9';
            feedbackDiv.style.color = '#1f7840';
            feedbackDiv.style.border = '1px solid #b3e6c9';
        } else {
            feedbackDiv.style.background = '#e6f3fa';
            feedbackDiv.style.color = '#1e4d62';
            feedbackDiv.style.border = '1px solid #b8d3e5';
        }

        if (type === 'success') {
            setTimeout(() => {
                feedbackDiv.style.display = 'none';
            }, 10000);
        }
    }

    // TRXID to uppercase (Unchanged)
    const trxidInput = document.getElementById('trxid');
    if (trxidInput) {
        trxidInput.addEventListener('input', function(e) {
            this.value = this.value.toUpperCase();
        });
    }

    // Preload jspdf (Unchanged)
    if (typeof window.jspdf === 'undefined') {
        loadJSPDFLibrary().catch(() => {
            console.warn('jspdf preload failed');
        });
    }
});
