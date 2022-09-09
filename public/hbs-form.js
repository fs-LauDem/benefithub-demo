document.addEventListener("DOMContentLoaded", console.log("ready baby"))
console.log(document.getElementById("hbsForm"))

feedback = document.getElementById("feedback");

let getCurrentStep

hsData = {
    currentStep: 1,
    data: {},
    payload:{},
    email:null
  };

// if(!sessionStorage.getItem('hsData')) 
sessionStorage.setItem('hsData', JSON.stringify(hsData)) ;

let getMail = ()=>{
    let data = getSession()
    return data.email;
}

let getSession = ()=>{
    let data = JSON.parse(sessionStorage.getItem('hsData'));
    return data;
}

let setSession = (data) => {
    sessionStorage.setItem('hsData', JSON.stringify(data))
}

let setPayload = (payload)=>{
    let data = getSession();
    data.payload = payload;
    setSession(data);
}

let getData = ()=>{
    let session = getSession();
    return session.data;
}

let appendData = (toAppend) => {
    let data = getData();
    let newData = {...data, ...toAppend}
    let session = getSession();
    session.data = newData;
    setSession(session);
}

let currentStep = ()=>{
    let session = getSession();
    return session.currentStep
}

let setCurrentStep = (step)=>{
    let session = getSession();
    session.currentStep = step;
    setSession(session);
}

let forms = {
    1: {
        id: "326da698-fcfb-4d23-b30a-eb30f0b02204"
    },
    2: {
        id: "6337d5f6-1a1b-4927-bd39-b7fe7a65694a"
    },
    3:{
        id:"088bd196-d182-438e-a5a8-99508470077b"
    }
}



let checkout = () => {

    let data = getData();
    console.log(data)
    // return;

    let payload = {
        contact: {
            email: data.email,
            firstName: data.firstname,
            lastName: data.lastname,
            company: data["0-2/name"]
        },
        address: {
            addressLine1: data["0-2/address"],
            postalCode: data["0-2/zip"],
            city: data["0-2/city"],
            country: data.country,
            phoneNumber: data.phone
        },
        items: 
          [
              {
                product: "benefithub-subscription",
                quantity: data["0-2/numberofemployees"],
              }
          ]
      }

      console.log(payload)

    fastspring.builder.secure(payload, null);
    fastspring.builder.checkout();
}

let next = ()=>{

    

    if(currentStep() == 1) {
        setCurrentStep(2);
        let session = getSession();
        session.email = session.data.email;
        setSession(session)
        document.getElementById("hbsForm").innerHTML = "";
        createForm(2)
        return;
      }

    if(currentStep()== 2) {
        checkout()
    }

    if(currentStep()==3) {
        let onCheckoutElem = document.getElementById("onCheckout");
        onCheckoutElem.style.display = "none";
    }

}

let createForm = (formId=1) => {

    

    hbspt.forms.create({
        region: "eu1",
        portalId: "26212059",
        formId: forms[formId].id,
        target:"#hbsForm",
        onFormSubmit: (elem, data)=>{
          console.log(data)
          console.log(elem)  
          appendData(data);

          
    
        },
        onFormSubmitted: (a,b,c,d)=> {
            next()
        },
        onFormReady: (form) => {
            if(formId > 1){
                let mailInput = form.querySelectorAll("div.hs_email input[name='email']")[0];
                let val = getMail();
                mailInput.setAttribute('value',val);
                mailInput.dispatchEvent(new Event('input', { bubbles: true }));

                let elem = form.querySelector("div.hs_email");
                elem.style.display = "none";
            }
        },
      });
    
}

function onSuccessfulCheckout(data) {
    console.log("onSuccessfulCheckout", data)
    setCurrentStep(3)
    let onCheckoutElem = document.getElementById("onCheckout");
    onCheckoutElem.style.display = "block";
    onCheckoutElem.classList.add("successful");
    console.log(onCheckoutElem);
    let message = "Your Order <span>"+ data.reference +"</span> has been successfully completed!";
    onCheckoutElem.innerHTML = message;
    let form = document.getElementById("hbsForm");
    console.log(form);
    form.innerHTML = "";
    createForm(3);
    // return;
    // createForm(3);
}

createForm()
