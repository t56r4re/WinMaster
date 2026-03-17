// project-folder/js/payment.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('order-form');
    const feedbackDiv = document.getElementById('form-feedback');
    
    // Your Google Apps Script URL - KEEP YOUR EXISTING URL
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUZZpPVwpbK8rJYZrwUb0izpMTiDkqXlDWRWp9t0-1MTGNWHtqyvHZ_-bESCcOETKN/exec';
    
    // EmailJS Configuration
    const EMAILJS_PUBLIC_KEY = "Z5NCTvs9INi1p7TMd";
    const EMAILJS_SERVICE_ID = "service_4jkpsfx";
    const EMAILJS_TEMPLATE_ID = "template_8169k0m";

    // Rate limiting
    let submissionCount = 0;
    const MAX_SUBMISSIONS = 3;
    const RATE_LIMIT_WINDOW = 60000; // 1 minute
    let lastSubmissionTime = 0;

    // Initialize EmailJS when available
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

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

        // Validate inputs
        if (!name || !email || !method || !trxid) {
            showFeedback('Please fill all required fields.', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFeedback('Enter a valid email address.', 'error');
            return;
        }
        
        // TrxID format validation
        if (trxid.length < 5) {
            showFeedback('Transaction ID seems too short.', 'error');
            return;
        }

        // Disable button and show loading
        const submitBtn = document.getElementById('submit-order');
        const originalText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = '⏳ Verifying payment...';

        try {
            // Show sending feedback
            showFeedback('Verifying your transaction...', 'info');
            
            // Verify TRXID with Google Sheets
            const verificationResult = await verifyTRXID(trxid, name, email, method);
            
            if (verificationResult.success) {
                // Payment verified successfully
                showFeedback('✅ ' + verificationResult.message, 'success');
                
                // 🚀 NEW: Send access link email automatically
                setTimeout(() => {
                    sendAccessEmail(name, email, trxid);
                }, 1000); // 1 second delay
                
                // Clear form after success
                setTimeout(() => {
                    form.reset();
                }, 5000);
                
            } else {
                showFeedback('❌ ' + verificationResult.message, 'error');
            }
            
        } catch (error) {
            console.error('Verification error:', error);
            showFeedback('Connection error. Please try again.', 'error');
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    });

    // ✅ NEW: EmailJS send function (আপনার style এ)
    function sendAccessEmail(name, email, trxid) {
        if (typeof emailjs === 'undefined') {
            console.log('EmailJS not loaded');
            return;
        }

        // Generate unique access link
        const accessToken = btoa(trxid + Date.now()).slice(0, 20);
        const accessLink = `https://yourwebsite.com/access?token=${accessToken}&trx=${trxid}`;
        
        showFeedback('📧 Sending access link to your email...', 'info');

        const templateParams = {
            user_name: name,
            user_email: email,
            access_link: accessLink,
            trxid: trxid
        };

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then((response) => {
                console.log('✅ Email sent:', response);
                showFeedback(`✅ Access link sent to ${email}! Check Gmail inbox/spam.`, 'success');
            }, (error) => {
                console.error('❌ Email error:', error);
                showFeedback('✅ Verified! Email issue - contact support.', 'error');
            });
    }

    function checkRateLimit() {
        const now = Date.now();
        
        if (now - lastSubmissionTime > RATE_LIMIT_WINDOW) {
            // Reset counter after window passes
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

    async function verifyTRXID(trxid, name, email, method) {
        try {
            // Build URL with parameters
            const params = new URLSearchParams({
                action: 'verify',
                trxid: trxid,
                name: name,
                email: email,
                method: method
            });
            
            const url = `${SCRIPT_URL}?${params.toString()}`;
            
            const response = await fetch(url);
            const text = await response.text();
            
            // Try to parse JSON response
            try {
                return JSON.parse(text);
            } catch (e) {
                // Fallback for text responses
                return {
                    success: text.toLowerCase().includes('success') || text.includes('Found'),
                    message: text
                };
            }
            
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.padding = '12px 16px';
        feedbackDiv.style.borderRadius = '12px';
        feedbackDiv.style.marginTop = '16px';
        
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
        
        // Auto hide after 8 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                feedbackDiv.style.display = 'none';
            }, 8000);
        }
    }
    
    // Add TrxID format helper (optional)
    const trxidInput = document.getElementById('trxid');
    if (trxidInput) {
        trxidInput.addEventListener('input', function(e) {
            // Convert to uppercase for better UX
            this.value = this.value.toUpperCase();
        });
    }
});

