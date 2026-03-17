// project-folder/js/email.js
const EMAILJS_PUBLIC_KEY = "Z5NCTvs9INi1p7TMd";
const EMAILJS_SERVICE_ID = "service_4jkpsfx";
const EMAILJS_TEMPLATE_ID = "template_8169k0m";

// ✅ আপনার নির্দিষ্ট এক্সেস লিংক এখানে দিন
const YOUR_CUSTOM_ACCESS_LINK_BASE = "https://drive.google.com/drive/folders/1iYlA1Gwqg-AuNUzmBDhil6AOmdP15N6Z?usp=sharing";  // ← এখানে আপনার লিংক

if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

function sendAccessEmail(name, email, trxid) {
    if (typeof emailjs === 'undefined') {
        console.log('EmailJS not loaded');
        if (typeof showFeedback === 'function') {
            showFeedback('⚠️ Email service unavailable', 'error');
        }
        return;
    }

    // ✅ নির্দিষ্ট লিংক + unique token
    const accessToken = btoa(trxid + Date.now() + Math.random()).slice(0, 20);
    const accessLink = `${YOUR_CUSTOM_ACCESS_LINK_BASE}${accessToken}?trx=${trxid}&user=${encodeURIComponent(name)}`;
    
    if (typeof showFeedback === 'function') {
        showFeedback('📧 Sending access link to your email...', 'info');
    }

    const templateParams = {
        user_name: name,
        user_email: email,
        access_link: accessLink,
        trxid: trxid
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then((response) => {
            console.log('✅ Email sent:', response);
            console.log('Access Link:', accessLink); // Debug দেখার জন্য
            if (typeof showFeedback === 'function') {
                showFeedback(`✅ Access link sent to ${email}! Check Gmail inbox/spam.`, 'success');
            }
        }, (error) => {
            console.error('❌ Email error:', error);
            if (typeof showFeedback === 'function') {
                showFeedback('✅ Verified! Email issue - contact support.', 'error');
            }
        });
}
