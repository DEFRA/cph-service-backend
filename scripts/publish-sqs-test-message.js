import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

const formMetaData = {
  sessionId: '4132b3f8-10bf-4bf3-9e16-e7a7a37ec7d9',
  retrievalKey: 'example-email-submission-recipient@defra.com',
  referenceNumber: 'FN4-AHL-2FW',
  main: [
    {
      name: 'JGLmzy',
      title: 'Are you 18 or older?',
      value: 'true',
    },
    {
      name: 'zcjEtV',
      title: 'Are you or your business already registered with the Rural Payments Agency?',
      value: 'false',
    },
    {
      name: 'aYjRCZ',
      title: 'What country will you keep livestock in?',
      value: 'England',
    },
    {
      name: 'yDwSNa',
      title: 'What date will the livestock arrive?',
      value: '2026-10-01',
    },
    {
      name: 'vumpmr',
      title: 'What livestock will you keep?',
      value: 'Cattle',
    },
    {
      name: 'FsSpLA',
      title: 'Are you a hobbyist keeper or a business?',
      value: 'Im a hobbyist keeper',
    },
    {
      name: 'QvSFQU',
      title: 'Title',
      value: 'Mr',
    },
    {
      name: 'fGBFPv',
      title: 'First name',
      value: 'Test',
    },
    {
      name: 'BzFtpG',
      title: 'Middle name',
      value: '',
    },
    {
      name: 'HEHgbQ',
      title: 'Last name',
      value: 'User',
    },
    {
      name: 'aEFhyW',
      title: "What's your main phone number?",
      value: '07070707070',
    },
    {
      name: 'tmSOkR',
      title: "What's your second phone number?",
      value: '',
    },
    {
      name: 'uZcVcc',
      title: "What's your email address?",
      value: 'email@email.com',
    },
    {
      name: 'hpmkrN',
      title: "What's your home address?",
      value: 'Address 1,Town,County,PO1 2CO',
    },
    {
      name: 'BToHwu',
      title: 'Will you keep livestock at your home address?',
      value: 'true',
    },
    {
      name: 'rOgnUv',
      title: 'Do you own the land?',
      value: 'true',
    },
    {
      name: 'yQiBlu',
      title: 'Do you want to add a second contact?',
      value: 'false',
    },
    {
      name: 'ledUEN',
      title: 'Do you want to tell the Rural Payments Agency anything else?',
      value: 'false',
    },
    {
      name: 'qIhSXZ',
      title: 'Do you intend to claim funding from the RPA?',
      value: 'false',
    },
    {
      name: 'XBhudw',
      title: 'Are the contact details for the cattle keeper the same as the person applying for the CPH number?',
      value: 'true',
    },
    {
      name: 'onzgeq',
      title: 'What will the cattle mainly be used for?',
      value: 'Beef',
    },
    {
      name: 'UcbQWn',
      title: 'What is the primary business purpose for keeping cattle for beef?',
      value: 'Finishing',
    },
    {
      name: 'WlCAiG',
      title: 'How many cattle will you keep, on average?',
      value: '100',
    },
    {
      name: 'MiEhCV',
      title: 'Are the cattle already on site?',
      value: 'true',
    },
    {
      name: 'xklZWO',
      title: 'How do you want to provide the ear tag numbers for cattle on your holding?',
      value: "I'll email the cattle ear tag numbers to the British Cattle Movement Service (BCMS) at a later date",
    },
    {
      name: 'CeHUdX',
      title: 'Do you have any other cattle herds?',
      value: 'false',
    },
    {
      name: 'XkUCYq',
      title: 'What veterinary practice do you use for TB testing?',
      value: 'Vets',
    },
    {
      name: 'rypJGc',
      title: "What's the address of your veterinary practice?",
      value: 'Vets Addres 1,Vets Town,Vets County,VE1 2TS',
    },
    {
      name: 'VnBKgk',
      title: 'What is the most effective time of the year for TB testing?',
      value: 'All year',
    },
    {
      name: 'hSjgMw',
      title: 'What reporting service will you use?',
      value: 'I do not use a reporting service',
    },
    {
      name: 'TTQnaU',
      title: 'Memorable date',
      value: '2001-01-01',
    },
    {
      name: 'JEmnQb',
      title: 'Memorable event',
      value: 'Event',
    },
    {
      name: 'DUrooj',
      title: 'Memorable town or city',
      value: 'Town',
    },
  ],
  repeaters: [
    {
      name: 'hNCJCl',
      title: 'Location',
      value: [
        [
          {
            name: 'UOmNur',
            title: "What's the easting and northing for the area where you'll keep livestock?",
            value: `Easting: 248741
Northing: 63688`,
          },
        ],
      ],
    },
  ],
}

const modifiedMetaData = {
  sessionId: '4132b3f8-10bf-4bf3-9e16-e7a7a37ec7d9',
  retrievalKey: 'example-email-submission-recipient@defra.com',
  referenceNumber: 'FN4-AHL-2AA',
  meta: {
    // Backend upserts on referenceNumber with $setOnInsert, so a fixed value means later sends are ignored
    referenceNumber: `FN4-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toString()
  },
  data: {
    main: {
      yDwSNa: {
        day: 19,
        month: 10,
        year: 2026
      }
    }
  }
}

const client = new SQSClient(
  {
    region: 'eu-west-2',
    endpoint: 'http://localhost:4566',
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
  })

await client.send(new SendMessageCommand(
  {
    QueueUrl: 'http://localhost:4566/000000000000/cph-form',
    MessageBody: JSON.stringify(
      {
        test: 'local-cph-check',
        source: `local-test ${new Date().toISOString()}`,
        ...modifiedMetaData
      })
  }))

console.log('Dummy message sent to local Floci queue')
