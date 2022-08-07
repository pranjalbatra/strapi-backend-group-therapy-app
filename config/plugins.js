module.exports = ({ env }) => ({
    // ...
    email: {
      config: {
        provider: 'sendgrid',
        providerOptions: {
          apiKey: env('SENDGRID_API_KEY'),
        },
        settings: {
          defaultFrom: 'pranjal.batra@memorehab.com.au',
          defaultReplyTo: 'pranjal.batra@memorehab.com.au'
        },
      },
    },
    // ...
});