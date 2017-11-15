const functions = require('firebase-functions');

const admin = require('firebase-admin');

const soap = require('soap');
const Buffer = require('buffer').Buffer;

admin.initializeApp(functions.config().firebase);

exports.helloWorld = functions.https.onRequest((req, res) => {
    res.send("Hello from firebase Cloud Functions");
});

exports.insertIntoDB = functions.https.onRequest((req, res) => {
    const text = req.query.text;
    admin.database().ref('/test').push({text: text})
        .then(snap => {
            res.redirect(303, snap.ref);
        });
});

exports.convertToUppercase = functions.database.ref('/test/{pushId}/text')  
    .onWrite(event => {
        const text = event.data.val();
        const uppercaseText = text.toUpperCase();
        return event.data.ref.parent.child('uppercaseText').set(uppercaseText);
    });

exports.InsertIntoAdiuto = functions.database.ref('/customer/{pushId}/visits/{visId}')  
    .onCreate(event => {
        
        const visit = event.data.val();
        
        const url = 'http://demo.creanetwork.it:8080/adiJed/services/AdiJedWS?wsdl';
        const args = {username: 'immission',
                     password: 'immission'};

        soap.createClient(url, function(err, client) {
        
            client.remoteLogin(args, function(err, result) {
                console.log(result);
                const session = result.loginResult;
                console.log(session);
                const buf = Buffer.from(' ');
                const ids = new Array(1333, 1334, 1335, 1336);
                const values = new Array();
                
                console.log('dati:' + JSON.stringify(visit));

                var dtstrip = visit.visitDate.toString().replace(/-/g, '');
                
                console.log(dtstrip);
                values.push(visit.name);
                values.push(dtstrip);
                values.push(visit.priority);
                values.push(visit.notes);
                
                var arrId = {};
                arrId['int'] = [1333, 1334, 1335, 1336];
                
                var arrValues = {};
                //arrValues['string'] = ['raso', '20171115', 'alta', 'note'];
                arrValues['string'] = values;
        
                const arg1 = {
                    "session-id": session,
                    "file": buf.toString('utf8'),
                    "filename": "test.xml",
                    "family-id": 1095,
                    "fields-id": arrId,
                    "values": arrValues
                };
               
                client.insertDocument(arg1, function(err, res) {
                    if (err) {
                        console.log(err);
                    }
                    var fidd = res;
                    console.log(fidd);
                });
            });
        });
    });


