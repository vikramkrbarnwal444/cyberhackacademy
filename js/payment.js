// ============================= //
//   PAYMENT.JS (FRONTEND)       //
// ============================= //

// ✅ CHANGE THIS ACCORDING TO WHERE YOUR SERVER IS RUNNING
const serverBase = "http://localhost:3000"; 
// Example for deployed version:
// const serverBase = "https://yourdomain.com";


// ✅ FORM SUBMIT HANDLER
async function handleForm(event) {
    event.preventDefault();

    const name = document.getElementById("entry.592380803").value.trim();
    const email = document.getElementById("entry.1804738912").value.trim();
    const phone = document.getElementById("entry.43387471").value.trim();

    if (!name || !email || !phone) {
        alert("Please fill all fields.");
        return false;
    }

    // ✅ First submit form to Google Sheets
    document.getElementById("buy-form").submit();

    // ✅ Then start payment after 1 second delay
    setTimeout(() => {
        startPayment(name, email, phone);
    }, 1000);

    return false;
}



// ✅ CREATE RAZORPAY ORDER (Talks to server.js)
async function startPayment(name, email, phone) {
    try {
        const response = await fetch(`${serverBase}/create-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone })
        });

        const order = await response.json();

        if (!order.id) {
            alert("Order creation failed. Please try again.");
            return;
        }

        openRazorpay(order, name, email, phone);

    } catch (error) {
        console.error(error);
        alert("Payment error. Check console.");
    }
}



// ✅ OPEN RAZORPAY CHECKOUT POPUP
function openRazorpay(order, name, email, phone) {

    const options = {
        key: order.key, 
        amount: order.amount,
        currency: "INR",
        name: "Cyber Hack Academy",
        description: "Course Purchase",
        order_id: order.id,

        prefill: { name, email, contact: phone },

        theme: { color: "#121212" },

        handler: function (response) {
            verifyPayment(response);
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}



// ✅ VERIFY PAYMENT AFTER SUCCESSFUL RAZORPAY CHECKOUT
async function verifyPayment(paymentResponse) {

    try {
        const verifyRes = await fetch(`${serverBase}/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentResponse)
        });

        const data = await verifyRes.json();

        if (data.success) {
            alert("✅ Payment Successful! Joining WhatsApp group...");

            // ✅ Open group invite link returned from server.js
            window.location.href = data.groupLink;
        } else {
            alert("❌ Payment Failed! Contact support.");
        }

    } catch (err) {
        console.error(err);
        alert("Verification error.");
    }
}
