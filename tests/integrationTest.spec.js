var integrationTest = require('../functions/source/IntegrationTest/index');

process.env.API_HOST='smg-s-loadb-1w7j39tp4hc51-1561128529.us-east-1.elb.amazonaws.com';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

function test(){
    console.log('Validate that we can post data to integration test endpoint');
    var state = {
        event: {},
        context: {},
        dto: {
            apiToken: 'd65d7f23-d262-44aa-a50c-2e8e4630917e',
            connectInstanceId: '2fee1c1f-9d48-42f9-99ee-d129e70dd33f'
        }
    };

    integrationTest.getData(state);
}
test();