function showPaymentDialog(packageName, amount, uptime) {
    document.getElementById('paymentDialogTitle').textContent = packageName + ' - Payment';
    document.getElementById('amountDisplay').textContent = amount;
    document.getElementById('uptime').textContent = uptime;
    document.getElementById('paymentDialog').style.display = 'block';
    document.getElementById('paymentBackdrop').style.display = 'block';
}

function hidePaymentDialog() {
    document.getElementById('paymentDialog').style.display = 'none';
    document.getElementById('paymentBackdrop').style.display = 'none';
    document.getElementById('phoneNumber').value = ''; // Clear phone number when closing
}

function formatPhoneNumber(phone) {
    phone = phone.replace(/[^\d]/g, '');
    if (phone.startsWith('0')) {
        phone = '256' + phone.substring(1);
    }
    if (!phone.startsWith('256')) {
        phone = '256' + phone;
    }
    return phone;
}

  function generateReference() {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        return `PAY-${timestamp}-${random}`;
    }
    function showLoadingDialog(message) {
        console.log('showing');
        document.getElementById('loadingDialog').style.display = 'block';
        if (message) {
          document.getElementById('loadingStatus').textContent = message;
        }
      }

      function updateLoadingStatus(message) {
        document.getElementById('loadingStatus').textContent = message;
      }

      function hideLoadingDialog() {
        document.getElementById('loadingDialog').style.display = 'none';
      }


    async function makePayment() {
        const phoneNumber = document.getElementById('phoneNumber').value;
        const uptime = document.getElementById('uptime').textContent;

        if (!phoneNumber) {
            alert('Please enter a phone number');
            return;
        }

        // Simple validation for phone number format
        const formattedPhone = formatPhoneNumber(phoneNumber);
        if (!formattedPhone) {
            alert('Please enter a valid phone number');
            return;
        }
        
        showLoadingDialog('Initializing payment...');

        const refer = generateReference();
   try{
    console.log('ably initiate');
          const ably = new Ably.Realtime({
            key: 'Cnqijg.mxacUg:NPkT-mYLxMz_oaOPnMK8B--m_EQUTsnXb6Q0xK4lkDw',
            transports: ['web_socket'],
            useBinaryProtocol: false,
            autoConnect: false,
            disconnectedRetryTimeout: 15000,
            suspendedRetryTimeout: 30000,
            httpRequestTimeout: 15000,
            realtimeRequestTimeout: 10000,
            fallbackHosts: ['a.ably-realtime.com', 'b.ably-realtime.com', 'c.ably-realtime.com']
          });

          // Set up connection handler
          ably.connection.on((stateChange) => {
            console.log('Ably connection state changed:', stateChange.current);
            updateLoadingStatus('Connection status: ' + stateChange.current);
            
            if (stateChange.current === 'connected') {
              console.log('Connected to Ably');
              updateLoadingStatus('Connected to payment system. Processing payment...');
              setupChannel(refer);
            }
          });

          // Connect to Ably
          ably.connect();

          function setupChannel(refer) {
            const channel = ably.channels.get(refer);
            
            channel.attach((err) => {
              if (err) {
                console.error('Error attaching to channel:', err);
                updateLoadingStatus('Error connecting to payment system');
                return;
              }
              
              console.log('Successfully attached to channel');
              updateLoadingStatus('Payment channel established. Processing transaction...');
              
              // Subscribe to token events
              channel.subscribe('token_event', (message) => {
                try {
                  const token = message.data.token;
                  console.log('Received token from channel:', token);
                  updateLoadingStatus('Payment confirmed! Redirecting...');
                  
                  // Redirect to login page with token
                  setTimeout(() => {
                    window.location.href = "https://www.google.com";
                  }, 1000);
                } catch (error) {
                  console.error('Error processing token event:', error);
                  updateLoadingStatus('Error processing payment response');
                }
              }, (err) => {
                if (err) {
                  console.error('Error subscribing to channel:', err);
                  updateLoadingStatus('Error connecting to payment channel');
                }
              });

              // Proceed with payment request
              proceedWithPayment();
            });
          }

          async function proceedWithPayment() {
              



        // Get payment details
        const amount = document.getElementById('amountDisplay').textContent;
        const packageName = document.getElementById('paymentDialogTitle').textContent.split(' - ')[0];

        // Show loading state
        const payButton = document.querySelector('.payment-dialog button.pay');
        const originalText = payButton.textContent;
        payButton.textContent = 'Processing...';
        payButton.disabled = true;

        // Prepare payment data
        const innovausername = CONFIG.INNOVA_USERNAME;
        const innovapassword = CONFIG.INNOVA_PASSWORD;
        const apiUrl = CONFIG.API_URL;
        const sucessredirectionurl =
            'none';
        const failedredirectionurl =
            'none';
        const paymentData = {
            number: formattedPhone,
            amount: amount.toString(),
            refer: refer,  // Use the same reference that was used for the Ably channel
            package_name: packageName,
            'username': innovausername,
            'password': innovapassword,
            'uptime': uptime.toString().trim(),
            'network': 'Falcon WiFi',
            'dynamiclink': 'https://www.google.com', // Replace with your actual dynamic link
            'success-re-url': sucessredirectionurl,
            'failed-re-url': failedredirectionurl,
        };
        updateLoadingStatus('Sending payment request...');
        try {
            // Replace this URL with your actual Flask API endpoint

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error('Payment request failed'); }

            const result = await response.json();
            console.log('Payment response:', result);
            updateLoadingStatus('Payment request sent. Waiting for confirmation...');
        } catch (error) {
            console.error('Payment error:', error);
              updateLoadingStatus('Payment failed: ' + error.message);
              setTimeout(hideLoadingDialog, 3000);
        } finally {
            // Reset button state
            payButton.textContent = originalText;
            payButton.disabled = false;
        }
          }




   } catch(error){
    
    console.error('Payment error:', error);
              updateLoadingStatus('Payment failed: ' + error.message);
              setTimeout(hideLoadingDialog, 3000);
   }



    }

    // Close dialog when clicking outside
    document.getElementById('paymentBackdrop').onclick = hidePaymentDialog;


    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // When the page loads, check for username parameter
    document.addEventListener('DOMContentLoaded', function() {
        var urlUsername = getUrlParameter('username');
        if (urlUsername) {
            var usernameInput = document.getElementById('uservcr');
            if (usernameInput) {
                usernameInput.value = urlUsername;
                // Call doLoginVCR instead of direct form submission
                doLoginVCR();
            }
        }
    });
    // Login Voucher
    function doLoginVCR() {
        document.sendin.username.value = document.loginvcr.username.value;
        document.sendin.password.value = hexMD5('$(chap-id)' + document.loginvcr.username.value + '$(chap-challenge)');
        document.sendin.submit();
        return false;
    }



    var host = window.location.hostname;
    document.title = "Login Hotspot - " + host;
    function VoucherCode() {
        var uservalue = document.getElementById("uservcr").value; // .toLowerCase(); // .toUpperCase();
        document.getElementById("uservcr").value = uservalue;
    }
    document.getElementById("uservcr").focus();
    document.getElementById("uservcr").onkeyup = VoucherCode;


    $(document).ready(function() {
        window.setTimeout(function() {
            $(".infoError").fadeTo(1000, 0).slideUp(1000, function() {
                $(this).remove();
            });
        }, 10000);
    });

    // note
    var img = new Image();
    img.onload = function(){
        document.getElementById("NOTE").innerHTML = '<i class="fa fa-circle online"></i> Server is online!';
    };
    img.onerror = function() {
        var offln = document.querySelector('.rad-dropmenu-item');
        offln.classList.add('active');
        document.getElementById("NOTE").innerHTML = '<i class="fa fa-circle covid 19 kills"></i>We are building a better internet connected community';
    };
    // Check connection status
    img.src = 'https://laksa19.github.io/img/voucher/cbp.png';

    var addActive = function(e){
        e.stopPropagation();
        $(".rad-dropmenu-item").toggleClass("active");
    };
    var removeActive = function(){
        $('.rad-dropmenu-item.active').removeClass('active');
    };
    $(document).ready(function() {
        $('li.rad-dropdown > a.rad-menu-item').on('click',addActive);
        $('body').on('click',removeActive);
    });

    function toggleMenu() {
        const menu = document.getElementById('dropdownMenu');
        menu.classList.toggle('show');
    }

    // Close menu when clicking outside
    window.addEventListener('click', function(e) {
        const menu = document.getElementById('dropdownMenu');
        const menuIcon = document.querySelector('.menu-icon');
        if (!menuIcon.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('show');
        }
    });
    