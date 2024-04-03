const currentDate = new Date();
const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}-${currentDate.getFullYear()}`;

 export const dataPdf = {
    apiKey: "free", // Please register to receive a production apiKey: https://app.budgetinvoice.com/register
    mode: "development", // Production or development, defaults to production   
    images: {
        logo: "https://public.budgetinvoice.com/img/logo_en_original.png",
        background: "https://public.budgetinvoice.com/img/watermark-draft.jpg"
    },
    sender: {
        company: "E-care",
        address: "YMC Kozhikode ",
        zip: "1234 AB",
        city: "Kozhikode",
        country: "kerala"
      
    },
    client: {
        company: "Client Corp",
        address: "Clientstreet 456",
        zip: "4567 CD",
        city: "Clientcity",
        country: "Clientcountry"
       
    },
    information: {
        // Invoice number
        number: "2021.0001",
        // Invoice data
        date: formattedDate,
        // Invoice due date
        dueDate: "31-12-2021"
    },
  
    products: [
        {
            quantity: 1,
            description: "Application Approved",
            taxRate: 0,
            price: 20000
        },
       
       
    ],
    bottomNotice: "Kindly pay your invoice within 3  days.",
    settings: {
        currency: "INR",
      
    },
    translate: {
    
        taxNotation: "" 
    },

 
};
