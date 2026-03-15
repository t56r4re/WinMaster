// project-folder/js/payment.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('order-form');
    const feedbackDiv = document.getElementById('form-feedback');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();          // prevent actual POST (no backend)
        
        // simulate form validation and backend call
        const name = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const method = document.getElementById('method').value;
        const trx = document.getElementById('trxid').value.trim();

        if (!name || !email || !method || !trx) {
            showFeedback('Please fill all required fields.', 'error');
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            showFeedback('Enter a valid email address.', 'error');
            return;
        }

        // Disable button to avoid double-click
        const submitBtn = document.getElementById('submit-order');
        submitBtn.disabled = true;
        submitBtn.innerText = 'processing...';

        // simulate network delay (payment verification)
        try {
            await new Promise(resolve => setTimeout(resolve, 1800));

            // ** Simulate successful backend verification **
            // In real implementation, here you would send data to server via fetch
            // and upon success, server would send email with access link.

            // For demo – we show success and redirect (concept)
            showFeedback('✅ Payment recorded! Check your email (demo – access link would be sent).', 'success');
            
            // Reset after a few seconds (in real scenario you redirect)
            submitBtn.disabled = false;
            submitBtn.innerText = 'submit order & verify';
            form.reset();

            // (optional) simulate email sending message
            setTimeout(() => {
                alert('📧 Demo: an email containing the secure access link would be sent to ' + email);
            }, 500);

        } catch (error) {
            showFeedback('Something went wrong. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerText = 'submit order & verify';
        }
    });

    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.style.background = type === 'error' ? '#fee9e7' : '#e2f7e9';
        feedbackDiv.style.color = type === 'error' ? '#b3402d' : '#1f7840';
        feedbackDiv.style.border = type === 'error' ? '1px solid #f3cdc5' : '1px solid #b3e6c9';
    }
});