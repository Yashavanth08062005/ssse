const axios = require('axios');

async function testBookingFlow() {
    try {
        console.log('🧪 Testing Booking Flow...\n');
        
        // Test 1: Register a new user
        console.log('1. Registering new user...');
        const registerResponse = await axios.post('http://localhost:8081/api/auth/register', {
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User',
            phone: '1234567890'
        });
        console.log('✅ User registered:', registerResponse.data.message);
        
        // Test 2: Login
        console.log('\n2. Logging in...');
        const loginResponse = await axios.post('http://localhost:8081/api/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('✅ User logged in:', loginResponse.data.message);
        const token = loginResponse.data.token;
        
        // Test 3: Search flights
        console.log('\n3. Searching flights...');
        const searchResponse = await axios.post('http://localhost:8081/beckn/search', {
            context: ;ingFlow()stBook
te    }
}
age);
messrror.| eta |sponse?.daerror.reailed:', t for('❌ Tes.errole  cons  or) {
    h (err
    } catc        ;
lly!')fud successletets compn🎉 All tesole.log('\   cons     
        
   }id);
     er?.age?.ordssdata.meingResponse.r ID:', booklog('   Ordeole.    cons      ;
  y!')ssfulled succeng creatog('✅ Bookisole.l   con       
              });
            }
` n}arer ${tokeion: `Beizat { Authoraders:         he{
               },  }
                      }
          "
       EDATte: "CRE        sta              ue } },
  ice.val flight.prNR", value:rency: "Iure: { c pricquote: {                  },
                                 }
                          }
234567890"one: "1 phle.com","test@exampil: ntact: { ema     co                      " },
     er: "maleser", gend"Test U:  nameson: {         per                       tomer: {
cus                          Y",
  : "DELIVER       type               
      fillment: {ful              
                    },           
          }                   123456"
  rea_code: "       a                   ",
      : "Indiaountry c                          e",
     "Test Stat  state:                          ty",
     est Ci"Tty: ci                                ",
eetTest Str "    street:                       ,
      "123"      door:                       {
      address:                          
4567890",phone: "123                         
   mple.com",est@exal: "t       emai                  
   ser", U"Test name:                         ng: {
         billi             ,
     t: 1 } }]tity: { counht.id, quan flig{ id:s: [em          it   
           ,d }rs[0].ialog.providense.data.catsearchRespoer: { id: id    prov                 
   (),owate.n" + Dt-order-  id: "tes                r: {
      rde     o               : {
     message
                },    g()
       OStrine().toISatew Damp: n    timest             ),
    Date.now(est-msg-" +"tmessage_id:                
     te.now(),-txn-" + Da_id: "teston  transacti               
   1",host:808//localri: "http:_u bap                   
",om.example.cry-bapavel-discoveap_id: "tr         b           1.1.0",
on: "     versi           ",
    tymobili  domain: "                
  irm","conf   action:                  text: {
con            {
     ',kn/confirm81/becost:80//localh('http:axios.post = await Responseonst booking c    ;
       ing...')reating book Clog('\n4.le.       conso     booking
reate  4: C    // Test 
               ;
    r.code).descripto flight',r.name, '-pto.descri, flightt found:' Fligh'  ole.log(      cons
      ].items[0];iders[0log.prova.catadatsponse.chRe sear =t flight  cons         ) {
 .length > 0iders?talog?.provta.caponse.da(searchRes
        if     );
    ngth || 0ers?.leprovid.catalog?..datahResponserc', seaproviders:nd d. Fouplete search com✅ Flightsole.log('        con);
        }     }
    }
                       }
                     }
            
                 }           
       OString()000).toIS5*60*60*1e.now() + 2e(Datw Datend: ne                            (),
    OString1000).toIS0* 24*60*6() +owDate.nnew Date(     start:                              range: {
                    e: {
           tim              umbai
       // M77" } }, 72.8719.0760,: { gps: " { locationend:                
        galore Ban} }, //,77.5946"  "12.9716s: { gp location:  start: {                    {
  nt: lme fulfil                   ILITY" },
"MOBry: { id:       catego            t: {
   inten      
         essage: {    m     ,
        }     g()
  SOStrinate().toI new Dmp: timesta            ow(),
   e.n Dat" +est-msg-"tessage_id:     m            now(),
 + Date.-txn-": "testidction_nsa      tra         ,
 81"host:80alttp://loc_uri: "hap       b
         le.com",bap.exampy-cover-distravelbap_id: "             ",
   1.1.0 "n:io   vers            ,
 mobility" domain: "            rch",
   "sea:      action  {
         