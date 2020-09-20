document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = send_mail;

  // By default, load the inbox
  inbox();
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function send_mail() {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  
  alert('Success!');
  load_mailbox('sent');
  return false;

}


function inbox() {

  const content = document.createElement('div');
  content.setAttribute('class', 'accordion');
  content.id = 'inboxdiv';
  document.querySelector('#content').append(content);

  const newdiv = document.querySelector('#inboxdiv')
  
  fetch('emails/inbox')
  .then(resp => resp.json())
  .then(mails => {
    console.log(mails);
    mails.forEach(mail => {
      
      newdiv.innerHTML += `
      
      <div class="card">
        <div class="card-header" id="heading${mail.id}">
          <h2 class="mb-0">
            <button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collapse${mail.id}" >
              <div class='container'>
                <div class='row'>
                  <div class='col-4'><strong>From:</strong> ${mail.sender}</div>
                  <div class='col-5'><strong>Subject:</strong> ${mail.subject}</div>
                  <div class='col-3'><span style='font-size: 14px;'><strong>Date:</strong> ${mail.timestamp}</span></div>
                </div>
              </div>    
            </button>
          </h2>
        </div>

        <div id="collapse${mail.id}" class="collapse" data-parent="#inboxdiv">
          <div class="card-body">
            <div class='container'>
              <div class='row'>
                <div class='col-12'><strong>From:</strong> ${mail.sender}</div>
                <div class='col-12'><strong>To:</strong> ${mail.recipients}</div>
                <div class='col-12'><strong>Subject:</strong> ${mail.subject}</div>
                <div class='col-12'><strong>Date:</strong> ${mail.timestamp}</div>  
              </div>
            </div>
            <hr>
            <div class='container'>
              <div class='row'>
                <div class='col-12' style='font-size: 20px;'><strong>Message:</strong></div>
                <div class='col-12'>${mail.body}</div>
                <div class='col-10'></div>
                <div class='col-2'><button class="btn btn-primary" id="reply">Reply</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      `
    });

  })
  

  load_mailbox('inbox');
}