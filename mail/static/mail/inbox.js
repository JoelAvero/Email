document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => inbox());
  document.querySelector('#sent').addEventListener('click', () => sent());
  document.querySelector('#archived').addEventListener('click', () => archive());
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = send_mail;

  
  // By default, load the inbox
  inbox();
});


// global variable, this controls whether the form should be emptied or not
var replyy = false;


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  
  // is this a reply or a new mail?
  if (window.replyy == false){
  // is a new mail, then clear all the fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

  }

  // set global variable
  window.replyy = false
}


// the same function with little changes
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


// send new mail to back-end
function send_mail() {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // check if all the fields are completeds
  if(recipients == '' || subject == '' || body == '' ){
    alert('Please, complete all the fields.');
    return false;
  }
  // a little and not optimal comprobation for the recipient field
  if(!recipients.includes('@')){
    alert("Please, check the recipient's email");
    return false;
  }

  // send the information "little filtered" to the back-end
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
  sent();
  return false;
}


// load inbox
function inbox() {

  // control for create new div, i want only one
  if(document.querySelector('#inboxdiv') == null){
    console.log('estoy entrando al if');
    // create a new div that contains the "accordion"
    const content = document.createElement('div');
    content.setAttribute('class', 'accordion');
    content.id = 'inboxdiv';
    document.querySelector('#content').append(content);;
  }

  const newdiv = document.querySelector('#inboxdiv')
  // set the initial value
  newdiv.innerHTML = ''

  // get inbox and create a new card for each mail
  fetch('emails/inbox')
  .then(resp => resp.json())
  .then(mails => {
    console.log(mails);
    mails.forEach(mail => {
        let color
        if(mail.read == true){color = "lightgrey"}else{color = ""}
        newdiv.innerHTML += `
        
        <div class="card">
          <div class="card-header" id="heading${mail.id}" style="background-color: ${color};">
            <h2 class="mb-0">
              <button onclick='read(${mail.id})' class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collapse${mail.id}" >
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
                  <div class='col-9'></div>
                  <div class='col-3'><button class="btn btn-primary" onclick='reply(${mail.id})' id="reply">Reply</button>
                  <button class="btn btn-success" onclick='addArchive(${mail.id})' id="archive">Archive</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>    
        `
    });

  })
  
  return load_mailbox('inbox');
}


// load sentbox
function sent(){

  /*
  // create a new div that contains the "accordion"
  const content = document.createElement('div');
  content.setAttribute('class', 'accordion');
  content.id = 'inboxdiv';
  document.querySelector('#content').append(content);
  */

  const newdiv = document.querySelector('#inboxdiv')
  // set the initial value
  newdiv.innerHTML = ''

  // for each mail was sent, create a new card
  fetch('emails/sent')
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
                  <div class='col-4'><strong>To:</strong> ${mail.recipients}</div>
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
              
              </div>
            </div>
          </div>
        </div>
      </div>
      
      `
    });

  })

  return load_mailbox('sent')
}


// load archived mails
function archive() {

  /*
  // create a new div that contains the "accordion"
  const content = document.createElement('div');
  content.setAttribute('class', 'accordion');
  content.id = 'inboxdiv';
  document.querySelector('#content').append(content);
  */

  const newdiv = document.querySelector('#inboxdiv')
  // set the initial value
  newdiv.innerHTML = ''

  // get archived mails and create a new card for each mail
  fetch('emails/archive')
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
                <div class='col-3'><button class="btn btn-primary" id="reply" onclick='reply(${mail.id})'>Reply</button>
                <button class="btn btn-success" onclick='removeArchive(${mail.id})' id="archive">Unarchive</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      `
    

    });

  })
  
  return load_mailbox('archive');
}


// add mail to archived
function addArchive(id) {

  // get an mail by id and change the boolean 'archived' to true
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  });

  alert('archived');
  return inbox();
}


// remove mail from archived
function removeArchive(id) {

  // get mail by id and change the boolean 'archived' to false
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  });

  alert('unarchived');
  return archive();
}


// reply constructor
function reply(id) {
  
  // get mail by id, take data, and construct the reply template
  fetch(`emails/${id}`)
  .then(resp => resp.json())
  .then(mail => {
    document.querySelector('#compose-recipients').value = mail.sender;
    document.querySelector('#compose-subject').value = `Re: ${mail.subject}`;
    document.querySelector('#compose-body').value = `${mail.timestamp}, ${mail.sender} WROTE: ${mail.body}\nREPLY: `;
  });
  
  // set the global variable, this controls whether the form should be emptied or not
  window.replyy = true;
  compose_email();

}


// set if the mail was read or not
function read(id) {

  // get mail by id and change 'read' att by true, this was called when the user open an email in your inbox
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });

}