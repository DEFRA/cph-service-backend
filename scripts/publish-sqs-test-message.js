import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

const today = new Date()

const formMetaData = {
  meta: {
    schemaVersion: 1,
    timestamp: '2026-10-21T13:03:06.863Z',
    referenceNumber: `FN4-${Date.now().toString(36).toUpperCase()}`,
    formName: 'Apply for a county parish holding (CPH) number',
    formId: 'cph-1234-5678-9012-3456',
    formSlug: 'apply-for-a-county-parish-holding-cph-number',
    status: 'live',
    isPreview: false,
    notificationEmail: 'example-email-submission-recipient@defra.com',
    language: 'en-GB',
    versionMetadata: {
      versionNumber: 401,
      createdAt: '2026-09-25T15:26:13.720Z',
    },
  },
  data: {
    main: {
      JGLmzy: true,
      zcjEtV: false,
      aYjRCZ: 'England',
      yDwSNa: {
        day: 1,
        month: 1,
        year: 2027,
      },
      vumpmr: [
        'Cattle',
      ],
      FsSpLA: 'Im a hobbyist keeper',
      QvSFQU: 'Mr',
      fGBFPv: 'Test',
      BzFtpG: null,
      HEHgbQ: 'User',
      aEFhyW: '07070707070',
      tmSOkR: null,
      uZcVcc: 'email@email.com',
      hpmkrN: {
        addressLine1: 'Address 1',
        town: 'Town',
        county: 'County',
        postcode: 'PO1 2CO',
      },
      BToHwu: true,
      rOgnUv: true,
      yQiBlu: false,
      ledUEN: false,
      qIhSXZ: false,
      XBhudw: true,
      onzgeq: 'Beef',
      UcbQWn: 'Finishing',
      WlCAiG: 100,
      MiEhCV: true,
      xklZWO: "I'll email the cattle ear tag numbers to the British Cattle Movement Service (BCMS) at a later date",
      CeHUdX: false,
      XkUCYq: 'Vets',
      rypJGc: {
        addressLine1: 'Vets Addres 1',
        town: 'Vets Town',
        county: 'Vets County',
        postcode: 'VE1 2TS',
      },
      VnBKgk: [
        'All year',
      ],
      hSjgMw: 'I do not use a reporting service',
      TTQnaU: {
        day: today.getDay(),
        month: today.getMonth() + 1,
        year: today.getFullYear,
      },
      JEmnQb: 'Event',
      DUrooj: 'Town',
    },
    repeaters: {
      hNCJCl: [
        {
          UOmNur: {
            easting: 248741,
            northing: 63688,
          },
        },
      ],
    },
    files: {
    },
  },
  result: {
    files: {
      main: '',
      repeaters: {
      },
    },
  },
  conditionEvaluations: [
    {
      conditionId: '0fc2ed66-5f25-4009-ab90-a4beb342908d',
      outcome: 'false',
      references: [
        {
          componentId: 'ba9e2813-c7f9-4b45-9aec-0da81fe70c28',
          componentName: 'RdCZhq',
          answered: false,
        },
        {
          componentId: '56d93720-8615-45fd-a0bb-ed1ecc1eda6a',
          componentName: 'BToHwu',
          answered: true,
        },
      ],
    },
    {
      conditionId: '4b0f22e6-ae05-4adf-aaa0-ab0fbf897ce2',
      outcome: 'false',
      references: [
        {
          componentId: '5999d93a-19f9-431f-8a44-d00a515e6b8c',
          componentName: 'rOgnUv',
          answered: true,
        },
      ],
    },
    {
      conditionId: '091fafdf-d0ec-405e-b9da-b0c5c4b7e343',
      outcome: 'false',
      references: [
        {
          componentId: 'b9830591-6109-457c-bdb1-9baab10c600f',
          componentName: 'qLmGSL',
          answered: false,
        },
      ],
    },
    {
      conditionId: '6fc9e8a0-7faf-4f97-8da9-65313b9560e3',
      outcome: 'false',
      references: [
        {
          componentId: 'b9830591-6109-457c-bdb1-9baab10c600f',
          componentName: 'qLmGSL',
          answered: false,
        },
      ],
    },
    {
      conditionId: '0d36fc76-bba5-4f82-8085-70df5a6c763e',
      outcome: 'false',
      references: [
        {
          componentId: 'b9830591-6109-457c-bdb1-9baab10c600f',
          componentName: 'qLmGSL',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'bb5f3864-8f4c-4487-bb83-f2f5040aa68a',
      outcome: 'true',
      references: [
        {
          componentId: '5999d93a-19f9-431f-8a44-d00a515e6b8c',
          componentName: 'rOgnUv',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'ec6aa90e-b76d-48bc-bd8d-aa87f0ecc98a',
      outcome: 'false',
      references: [
        {
          componentId: '74c02b49-08b5-4a5b-8052-17173a2d513f',
          componentName: 'yHQAol',
          answered: false,
        },
        {
          componentId: '8695422a-92ec-4919-a374-39311c29bfe6',
          componentName: 'MfzkDz',
          answered: false,
        },
      ],
    },
    {
      conditionId: '600e4f58-4c32-4ce2-9bfd-0d18c7061f5c',
      outcome: 'false',
      references: [
        {
          componentId: '2167c54b-487f-4532-abc2-f8e707842121',
          componentName: 'aYjRCZ',
          answered: true,
        },
      ],
    },
    {
      conditionId: '5696c7ca-0384-403b-9637-5dd92dec70ba',
      outcome: 'true',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
      ],
    },
    {
      conditionId: '356a203f-51e0-4495-98b0-8aba0c52794d',
      outcome: 'false',
      references: [
        {
          componentId: '74c02b49-08b5-4a5b-8052-17173a2d513f',
          componentName: 'yHQAol',
          answered: false,
        },
      ],
    },
    {
      conditionId: '5a357cde-0d7d-47e8-902d-592a576bd330',
      outcome: 'false',
      references: [
        {
          componentId: '8695422a-92ec-4919-a374-39311c29bfe6',
          componentName: 'MfzkDz',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'e1033efa-63dc-4541-8b63-9e4a38541167',
      outcome: 'false',
      references: [
        {
          componentId: '6f7d05ee-ed13-4a29-b9f9-9d6348009c0d',
          componentName: 'AoofuF',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'ec04515c-1873-47d7-9a6e-99bc84d256ce',
      outcome: 'false',
      references: [
        {
          componentId: 'ce1640ec-4b5a-4960-89fd-2a59bce07a23',
          componentName: 'luoxoh',
          answered: false,
        },
      ],
    },
    {
      conditionId: '3faf63ab-0411-4b0c-a927-8fa2877c7c8a',
      outcome: 'false',
      references: [
        {
          componentId: '85ae72d2-b98f-4f72-a282-3c9f0049d974',
          componentName: 'zcjEtV',
          answered: true,
        },
      ],
    },
    {
      conditionId: '89a69225-c7e4-4491-b414-fce147947a3b',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'efc7cc02-51ec-4d5d-aa37-224d367320a7',
      outcome: 'false',
      references: [
        {
          componentId: '74c02b49-08b5-4a5b-8052-17173a2d513f',
          componentName: 'yHQAol',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'fbd61ae5-942d-4486-9af2-cbce4c046356',
      outcome: 'false',
      references: [
        {
          componentId: 'ff84df65-d789-44cd-b255-2ec42a29eb36',
          componentName: 'iszBCF',
          answered: false,
        },
      ],
    },
    {
      conditionId: '550e5a8e-8fec-4325-b258-eb6910c3706e',
      outcome: 'true',
      references: [
        {
          componentId: '74c02b49-08b5-4a5b-8052-17173a2d513f',
          componentName: 'yHQAol',
          answered: false,
        },
      ],
    },
    {
      conditionId: '9e31fc10-93c5-4ecf-8247-c7ec9d315dd5',
      outcome: 'false',
      references: [
        {
          componentId: 'f40eda7c-9ec6-4177-b011-27ae86c188fa',
          componentName: 'ledUEN',
          answered: true,
        },
      ],
    },
    {
      conditionId: '4bad85d0-2d53-4a0b-92c2-08da1d9c4833',
      outcome: 'false',
      references: [
        {
          componentId: 'a125ce13-94d2-4591-aec9-372d0e800ec6',
          componentName: 'yQiBlu',
          answered: true,
        },
      ],
    },
    {
      conditionId: '47323821-0b11-4899-8bea-eef76430e427',
      outcome: 'true',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'd457d28b-7440-4afa-bf34-65345b571cfc',
      outcome: 'false',
      references: [
        {
          componentId: 'f6f6836a-e184-436c-a0e0-440179e068da',
          componentName: 'yDwSNa',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'fd275fe4-b3d7-4271-9510-480dc96b794c',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'bd87eeaa-b1be-488f-b07f-d7fd9d3d3497',
      outcome: 'false',
      references: [
        {
          componentId: '8695422a-92ec-4919-a374-39311c29bfe6',
          componentName: 'MfzkDz',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'b454293b-598c-4e75-9d49-04c9a16a6e19',
      outcome: 'false',
      references: [
        {
          componentId: '74c02b49-08b5-4a5b-8052-17173a2d513f',
          componentName: 'yHQAol',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'f0de10a4-c46e-48d4-873f-d250223a2ef3',
      outcome: 'false',
      references: [
        {
          componentId: 'cddab2ab-57f2-4324-a852-8aa2990dd65a',
          componentName: 'JGLmzy',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'df342dab-3548-43ff-8f45-874e2bd070c1',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: '8c93636d-6215-440c-b6a6-9ff986ec6012',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
      ],
    },
    {
      conditionId: '9f8eadc7-0488-498e-ac1b-44cafa4b8bc7',
      outcome: 'false',
      references: [
        {
          componentId: 'ff84df65-d789-44cd-b255-2ec42a29eb36',
          componentName: 'iszBCF',
          answered: false,
        },
      ],
    },
    {
      conditionId: '1d510a63-583e-4b11-924e-21be184f8779',
      outcome: 'true',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: '7b93aea5-e763-4bf8-8376-6ccf0aeb6ca1',
      outcome: 'false',
      references: [
        {
          componentId: 'a125ce13-94d2-4591-aec9-372d0e800ec6',
          componentName: 'yQiBlu',
          answered: true,
        },
        {
          componentId: 'ff84df65-d789-44cd-b255-2ec42a29eb36',
          componentName: 'iszBCF',
          answered: false,
        },
      ],
    },
    {
      conditionId: '712a6347-9a74-4864-910f-b9d9d611ad98',
      outcome: 'true',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: '98c40d1d-c302-460a-ae7d-ff97558ceb94',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
        {
          componentId: '70ba1a9f-5090-4b62-b8d8-50e4fe69a196',
          componentName: 'XBhudw',
          answered: true,
        },
      ],
    },
    {
      conditionId: '68c14544-bcdf-482e-b019-8c1ffc397408',
      outcome: 'true',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
        {
          componentId: '34a905f2-ee54-48c2-b0af-004812ac5ce0',
          componentName: 'onzgeq',
          answered: true,
        },
      ],
    },
    {
      conditionId: '055e6f0a-058f-418c-8abb-68a77c2e26ef',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
        {
          componentId: '34a905f2-ee54-48c2-b0af-004812ac5ce0',
          componentName: 'onzgeq',
          answered: true,
        },
      ],
    },
    {
      conditionId: '0927f79b-b5f2-4c0b-b8f5-a423b136b7cc',
      outcome: 'false',
      references: [
        {
          componentId: 'c0908ea3-7970-439c-8934-5a2539e737a2',
          componentName: 'CeHUdX',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'd6ec3112-2423-4759-9795-719c9de44e74',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: '3944ff2a-2434-47aa-b6ab-9b08e2cf6a9a',
      outcome: 'false',
      references: [
        {
          componentId: '38a097d2-2327-4b90-8a0e-a6f407a3418f',
          componentName: 'FKoeLJ',
          answered: false,
        },
      ],
    },
    {
      conditionId: '71107e76-fe7b-4aee-b417-768bfa658943',
      outcome: 'false',
      references: [
        {
          componentId: '8a2e827e-683c-4cf1-b18c-566d32025fdf',
          componentName: 'mGpfRt',
          answered: false,
        },
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
      ],
    },
    {
      conditionId: '742c55fc-64b7-4f33-8932-14215b66d2fe',
      outcome: 'false',
      references: [
        {
          componentId: '8a2e827e-683c-4cf1-b18c-566d32025fdf',
          componentName: 'mGpfRt',
          answered: false,
        },
      ],
    },
    {
      conditionId: '504dfc7b-79c2-4579-962c-91654320b7a5',
      outcome: 'false',
      references: [
        {
          componentId: '8a2e827e-683c-4cf1-b18c-566d32025fdf',
          componentName: 'mGpfRt',
          answered: false,
        },
      ],
    },
    {
      conditionId: '7d8c45bc-1524-4c7b-860a-09b8a1bc5733',
      outcome: 'true',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: '4e6c8ce6-0ad2-47f8-a150-cb9b83f3725b',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'a0ed5318-be3b-480f-947c-7ea530de78d7',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
        {
          componentId: 'eedeee54-7489-43bb-8219-b8374d996e38',
          componentName: 'PJddbU',
          answered: false,
        },
      ],
    },
    {
      conditionId: '69561fca-a053-4182-a45e-2ee429cde73e',
      outcome: 'false',
      references: [
        {
          componentId: 'aa991923-d540-4bb2-a960-207bf99a0e82',
          componentName: 'WGOZNo',
          answered: false,
        },
      ],
    },
    {
      conditionId: '4bf3dce4-4bab-41e9-9755-822a0cc236ac',
      outcome: 'false',
      references: [
        {
          componentId: 'aa991923-d540-4bb2-a960-207bf99a0e82',
          componentName: 'WGOZNo',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'c60faa48-b040-4ed5-9967-da703ad6d7ee',
      outcome: 'false',
      references: [
        {
          componentId: 'aa991923-d540-4bb2-a960-207bf99a0e82',
          componentName: 'WGOZNo',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'a11f8a9e-03c2-4b9f-9597-e846cd38b074',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: '80122fc4-829e-4ea2-b8de-52172c56a383',
      outcome: 'false',
      references: [
        {
          componentId: 'c915a00a-2796-48c1-bdea-e06f986995f9',
          componentName: 'fjzFss',
          answered: false,
        },
      ],
    },
    {
      conditionId: '0b97a368-3614-44ab-b7f1-218c24b10451',
      outcome: 'false',
      references: [
        {
          componentId: '85ea52b6-a6f0-4f23-8f46-daa41dd2df8e',
          componentName: 'wQpKqo',
          answered: false,
        },
      ],
    },
    {
      conditionId: '83153f0f-0647-48a7-af01-af5ddd0439de',
      outcome: 'false',
      references: [
        {
          componentId: '85ea52b6-a6f0-4f23-8f46-daa41dd2df8e',
          componentName: 'wQpKqo',
          answered: false,
        },
      ],
    },
    {
      conditionId: '826179c0-485e-4c0e-bd47-e2da29f40f2c',
      outcome: 'false',
      references: [
        {
          componentId: '85ea52b6-a6f0-4f23-8f46-daa41dd2df8e',
          componentName: 'wQpKqo',
          answered: false,
        },
      ],
    },
    {
      conditionId: '1d5b8532-2c8b-494d-af41-9a9b278d6735',
      outcome: 'false',
      references: [
        {
          componentId: '755de82c-c063-4864-8d18-52798045aa8d',
          componentName: 'eltlsp',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'b4662ee6-cc71-4bd5-bae9-86724088a291',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: '6017a5ba-3693-4469-bf6a-21d8f4c460d0',
      outcome: 'false',
      references: [
        {
          componentId: 'b5b302f7-fd8c-470d-97ff-e62edcaeaf84',
          componentName: 'XjUQci',
          answered: false,
        },
      ],
    },
    {
      conditionId: '2b532911-57a1-4f12-913b-f0db16a521fb',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'e7f3b8f0-3e16-42b0-9bfd-4e4e3481e5c0',
      outcome: 'false',
      references: [
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'ccf5ccd3-b4c4-408b-86b8-655a08a726f4',
      outcome: 'false',
      references: [
        {
          componentId: 'b8e3ccf2-a3ab-4124-b87d-2ea67695984c',
          componentName: 'EzXmBh',
          answered: false,
        },
      ],
    },
    {
      conditionId: '2e95ac56-429f-45fe-be27-4b97dfbfbef4',
      outcome: 'false',
      references: [
        {
          componentId: 'a487f713-c7c3-46b5-bea2-c0d541b2928f',
          componentName: 'lsFcPe',
          answered: false,
        },
      ],
    },
    {
      conditionId: '5b8a7b99-c92e-443c-a60a-11d2344bd34a',
      outcome: 'false',
      references: [
        {
          componentId: 'a487f713-c7c3-46b5-bea2-c0d541b2928f',
          componentName: 'lsFcPe',
          answered: false,
        },
      ],
    },
    {
      conditionId: '0f80cf51-ac11-47a1-9755-a1b293884274',
      outcome: 'false',
      references: [
        {
          componentId: 'a487f713-c7c3-46b5-bea2-c0d541b2928f',
          componentName: 'lsFcPe',
          answered: false,
        },
      ],
    },
    {
      conditionId: '685a1301-8e2b-4650-8d1b-853d49508b32',
      outcome: 'false',
      references: [
        {
          componentId: 'a487f713-c7c3-46b5-bea2-c0d541b2928f',
          componentName: 'lsFcPe',
          answered: false,
        },
      ],
    },
    {
      conditionId: '8f291a6b-33a4-4f0a-90af-2274fdda31b6',
      outcome: 'false',
      references: [
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'ae63754e-e9be-465e-b826-586bf3c0cc38',
      outcome: 'false',
      references: [
        {
          componentId: 'aacfe6d1-eefb-447b-997a-acb8db9201c3',
          componentName: 'EKfseX',
          answered: false,
        },
      ],
    },
    {
      conditionId: '1325ec6b-01b8-4f0d-8748-f477c3e33283',
      outcome: 'false',
      references: [
        {
          componentId: '4a30454f-707e-42e9-9d12-37a049ee7c73',
          componentName: 'tNhLIa',
          answered: false,
        },
      ],
    },
    {
      conditionId: '73728a88-61e9-4f8e-b315-5506295020d1',
      outcome: 'false',
      references: [
        {
          componentId: '4a30454f-707e-42e9-9d12-37a049ee7c73',
          componentName: 'tNhLIa',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'b5f9b182-80d2-425f-bdd8-b9563fd0b61b',
      outcome: 'false',
      references: [
        {
          componentId: '4a30454f-707e-42e9-9d12-37a049ee7c73',
          componentName: 'tNhLIa',
          answered: false,
        },
      ],
    },
    {
      conditionId: '2ee3fce9-5e1a-4cd4-a5a6-89599f8442fe',
      outcome: 'false',
      references: [
        {
          componentId: '4a30454f-707e-42e9-9d12-37a049ee7c73',
          componentName: 'tNhLIa',
          answered: false,
        },
      ],
    },
    {
      conditionId: '6e526587-e14a-42f8-8d4a-b62a0bd291e4',
      outcome: 'false',
      references: [
        {
          componentId: '4a30454f-707e-42e9-9d12-37a049ee7c73',
          componentName: 'tNhLIa',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'a254da97-e4f9-4d33-8325-5f1799dccf2d',
      outcome: 'false',
      references: [
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '6856d283-a392-419f-b134-5908f1d2f356',
      outcome: 'false',
      references: [
        {
          componentId: '889564d6-3c9e-4a40-b3be-d85a6b63dcd4',
          componentName: 'yxpYiH',
          answered: false,
        },
      ],
    },
    {
      conditionId: '01aadb8d-544c-4996-94d5-36f2e9fd042a',
      outcome: 'false',
      references: [
        {
          componentId: 'd0b64546-fed0-41f3-ad2d-b4506770c53b',
          componentName: 'JoIUrK',
          answered: false,
        },
      ],
    },
    {
      conditionId: '06431b8a-9ccb-45ba-ba98-800a5f412fa3',
      outcome: 'false',
      references: [
        {
          componentId: 'd0b64546-fed0-41f3-ad2d-b4506770c53b',
          componentName: 'JoIUrK',
          answered: false,
        },
      ],
    },
    {
      conditionId: '7b88d1d5-ada4-402e-a746-5743e2fd1116',
      outcome: 'false',
      references: [
        {
          componentId: 'd0b64546-fed0-41f3-ad2d-b4506770c53b',
          componentName: 'JoIUrK',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'c489b1ba-184c-4a62-b8c7-a9bf7fb81534',
      outcome: 'false',
      references: [
        {
          componentId: 'd0b64546-fed0-41f3-ad2d-b4506770c53b',
          componentName: 'JoIUrK',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'a3a7c40d-7c72-40fd-82fc-080e4930e1df',
      outcome: 'false',
      references: [
        {
          componentId: 'd0b64546-fed0-41f3-ad2d-b4506770c53b',
          componentName: 'JoIUrK',
          answered: false,
        },
      ],
    },
    {
      conditionId: '45ced75c-cdd0-4643-a2c0-9f9376ef1426',
      outcome: 'false',
      references: [
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '0fc4533a-96d4-437d-8909-7535c391d848',
      outcome: 'false',
      references: [
        {
          componentId: '061eabbf-6add-405a-8638-1109cc86277b',
          componentName: 'NdkRyY',
          answered: false,
        },
      ],
    },
    {
      conditionId: '62a1b504-945c-4eb1-933f-f44c43e3232d',
      outcome: 'false',
      references: [
        {
          componentId: 'bbaf7dfd-b334-47f8-818c-fbcb0bc09c2c',
          componentName: 'sPenlz',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'f141b157-d930-4e57-9cd4-9747336ff967',
      outcome: 'false',
      references: [
        {
          componentId: 'bbaf7dfd-b334-47f8-818c-fbcb0bc09c2c',
          componentName: 'sPenlz',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'c8a6a973-2855-4f2d-942b-a7393dcf38ad',
      outcome: 'false',
      references: [
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '878f4a5d-dacf-49be-b534-8233cd3a78c5',
      outcome: 'false',
      references: [
        {
          componentId: 'd0412d71-85e1-4a47-8cee-053b80740784',
          componentName: 'kxtWQb',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'bfdf6325-e3e4-45bf-bd79-0fe0003b0071',
      outcome: 'false',
      references: [
        {
          componentId: '8b21187a-026d-4825-a4e9-f0d320441cbb',
          componentName: 'JycUWJ',
          answered: false,
        },
      ],
    },
    {
      conditionId: '2fb25f7f-086d-4fc8-8892-a40beec6a4ec',
      outcome: 'false',
      references: [
        {
          componentId: '8b21187a-026d-4825-a4e9-f0d320441cbb',
          componentName: 'JycUWJ',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'baa2f5fa-8061-44f8-8bb2-d12faf9511ba',
      outcome: 'false',
      references: [
        {
          componentId: '8b21187a-026d-4825-a4e9-f0d320441cbb',
          componentName: 'JycUWJ',
          answered: false,
        },
      ],
    },
    {
      conditionId: '157afeda-e390-4ea4-a049-08c3fba7332d',
      outcome: 'false',
      references: [
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '361b18e3-f7e7-4509-bb0a-7304861ac34e',
      outcome: 'false',
      references: [
        {
          componentId: 'fdcd0ac3-e7bf-4351-a822-25b9d7ec28f8',
          componentName: 'OsvyLJ',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'cd9aca47-087d-4c67-a1c6-ed5033d58e16',
      outcome: 'false',
      references: [
        {
          componentId: 'b2181294-98ff-44d9-93f9-1d2a683fae10',
          componentName: 'FDoZpx',
          answered: false,
        },
      ],
    },
    {
      conditionId: '6f634cc3-7e00-460d-88d1-324a4905e971',
      outcome: 'false',
      references: [
        {
          componentId: 'b2181294-98ff-44d9-93f9-1d2a683fae10',
          componentName: 'FDoZpx',
          answered: false,
        },
      ],
    },
    {
      conditionId: '8c374b97-3d5c-4a64-8748-8b43116764a9',
      outcome: 'false',
      references: [
        {
          componentId: 'b2181294-98ff-44d9-93f9-1d2a683fae10',
          componentName: 'FDoZpx',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'd71601da-2c0c-4d07-b3de-92d2bdd1f738',
      outcome: 'false',
      references: [
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '7e27a53b-1152-4940-bb9a-da9e5fd6c478',
      outcome: 'false',
      references: [
        {
          componentId: '8c014ddb-f793-400c-adfb-ca9aa31f5e6f',
          componentName: 'OpSrdf',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'ead12b8b-40a2-4949-b4bd-cb94bcd99ebf',
      outcome: 'false',
      references: [
        {
          componentId: 'b26e7981-a430-472a-8c87-b273ec389f44',
          componentName: 'WigZWk',
          answered: false,
        },
      ],
    },
    {
      conditionId: '4d3fe381-113a-4947-aa35-b49086682344',
      outcome: 'false',
      references: [
        {
          componentId: 'b26e7981-a430-472a-8c87-b273ec389f44',
          componentName: 'WigZWk',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'c56eda75-6db6-4f37-9509-a7a1a1db31e0',
      outcome: 'false',
      references: [
        {
          componentId: 'b26e7981-a430-472a-8c87-b273ec389f44',
          componentName: 'WigZWk',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'ca1f24bd-f89a-41e8-a4bb-1e73f076254c',
      outcome: 'false',
      references: [
        {
          componentId: 'b26e7981-a430-472a-8c87-b273ec389f44',
          componentName: 'WigZWk',
          answered: false,
        },
      ],
    },
    {
      conditionId: '4a02dd2d-67be-4cc9-add7-974291bb84f5',
      outcome: 'false',
      references: [
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '0e208720-d212-43fa-b365-d7021f91a2d3',
      outcome: 'false',
      references: [
        {
          componentId: 'a487f713-c7c3-46b5-bea2-c0d541b2928f',
          componentName: 'lsFcPe',
          answered: false,
        },
        {
          componentId: '4a30454f-707e-42e9-9d12-37a049ee7c73',
          componentName: 'tNhLIa',
          answered: false,
        },
        {
          componentId: 'd0b64546-fed0-41f3-ad2d-b4506770c53b',
          componentName: 'JoIUrK',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'ffaecdba-f3a9-4282-bc0c-28bfdc14e0c4',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'edca671d-6e60-4e0c-8b46-8d6e27e75f27',
      outcome: 'false',
      references: [
        {
          componentId: '78f7efe7-3697-463b-9246-13a7eb288ace',
          componentName: 'xklZWO',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'e54feac0-365b-4195-8021-1b3c80e87875',
      outcome: 'false',
      references: [
        {
          componentId: '78f7efe7-3697-463b-9246-13a7eb288ace',
          componentName: 'xklZWO',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'd01f5c3d-7855-428b-92ee-517a5c888b1c',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: '03f5179f-e074-4737-82ee-fd326741d66d',
      outcome: 'true',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: '09fc24bc-dbf7-4002-8628-5393de0edae2',
          componentName: 'LlcVhf',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'ae0d54ec-4a73-49d4-b104-72ef3f674802',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '3411f185-1892-4503-b859-fd2a7686a59e',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'c43c690a-c0d9-4420-b86d-f37427ebc8e9',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '5e3ea71e-20c6-45f4-b03f-937516e61848',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '69bdb36c-4b83-4369-922e-386531e688e4',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '9539ae95-e960-41c9-aa27-dc85e6ed966b',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '7abf0538-dc1a-4d27-8200-1ba7d5ff66e6',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '6a28c724-1d68-404b-95b2-4f0cc4891199',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'e26bfe23-8cb4-423a-b42a-7f20b66460ba',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '01c336fc-566c-434c-ab5b-e5382e9d96ea',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '7ee734c5-b7c1-41fc-a49c-c2964c8a56c8',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '8124500c-2805-475d-a9ef-2b43d7dbab6f',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '13cae257-2463-41d1-a164-ee12e16eeec3',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '688b9ab3-2c7c-488a-874a-0100365bc025',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '53fc2426-9378-4a02-95bb-53746f560034',
      outcome: 'false',
      references: [
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
        {
          componentId: 'eb0b0f58-74b9-48bc-a083-5fa6ae149ea8',
          componentName: 'MmECpG',
          answered: false,
        },
      ],
    },
    {
      conditionId: '83d1def7-8bb0-474a-9e25-60ec6c40b525',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'b752c977-d65e-4bcb-944e-1eb0f57f6271',
      outcome: 'false',
      references: [
        {
          componentId: '7f41cece-ad85-43ad-8658-a099a92a34a1',
          componentName: 'CqBerI',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'd6a74488-dcf2-4a20-930c-719e1bbeb84b',
      outcome: 'false',
      references: [
        {
          componentId: 'c43b9bae-556b-49dc-8e45-83101759cc73',
          componentName: 'oDyRmj',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'caa61b4b-a55a-4fe1-ae6b-4c69ec8c8cb5',
      outcome: 'false',
      references: [
        {
          componentId: 'c43b9bae-556b-49dc-8e45-83101759cc73',
          componentName: 'oDyRmj',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'c5024f14-1d62-43b8-ab23-cded42fc7d23',
      outcome: 'false',
      references: [
        {
          componentId: '2f77941a-501d-440a-8028-8f15c7b11694',
          componentName: 'VoTgVE',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'e4d7258b-972d-422b-ad91-bc27102414b6',
      outcome: 'false',
      references: [
        {
          componentId: 'c43b9bae-556b-49dc-8e45-83101759cc73',
          componentName: 'oDyRmj',
          answered: false,
        },
      ],
    },
    {
      conditionId: '94f29071-addd-47a3-81f7-a09e68b42e2c',
      outcome: 'false',
      references: [
        {
          componentId: '12a0895f-32e6-457f-9334-18c91d076ad5',
          componentName: 'zdhOGu',
          answered: false,
        },
      ],
    },
    {
      conditionId: '9c24d2fd-47e9-4008-9c2e-7f17adba2c40',
      outcome: 'false',
      references: [
        {
          componentId: 'c43b9bae-556b-49dc-8e45-83101759cc73',
          componentName: 'oDyRmj',
          answered: false,
        },
      ],
    },
    {
      conditionId: '63540082-caac-4298-afb4-85b72f199c17',
      outcome: 'false',
      references: [
        {
          componentId: '6a719f83-299c-46c2-a826-c6b3c2e12ee7',
          componentName: 'CsoIbB',
          answered: false,
        },
      ],
    },
    {
      conditionId: '4fb336c1-1969-47d3-a7b4-dd8934493999',
      outcome: 'false',
      references: [
        {
          componentId: 'c43b9bae-556b-49dc-8e45-83101759cc73',
          componentName: 'oDyRmj',
          answered: false,
        },
      ],
    },
    {
      conditionId: '5887cff3-3a6c-4c7b-9a9e-533a0edcb7c0',
      outcome: 'false',
      references: [
        {
          componentId: '38a097d2-2327-4b90-8a0e-a6f407a3418f',
          componentName: 'FKoeLJ',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'b8c2e35b-5737-45bc-ac64-cab7b36fce17',
      outcome: 'false',
      references: [
        {
          componentId: '85ae72d2-b98f-4f72-a282-3c9f0049d974',
          componentName: 'zcjEtV',
          answered: true,
        },
      ],
    },
    {
      conditionId: '6856d077-b6d8-451e-8b4a-45be87f9bc42',
      outcome: 'false',
      references: [
        {
          componentId: '5ad33db7-ed1e-425b-9c35-0efcc9b1a34f',
          componentName: 'WHYPeQ',
          answered: false,
        },
      ],
    },
    {
      conditionId: '049de97a-3170-495d-a72e-3bc37faaf1fc',
      outcome: 'true',
      references: [
        {
          componentId: '6137830c-bf68-4c03-9e93-6f63c658dbbc',
          componentName: 'MiEhCV',
          answered: true,
        },
      ],
    },
    {
      conditionId: '6e0d79b8-2686-49ff-b731-9346129bf274',
      outcome: 'false',
      references: [
        {
          componentId: 'a4bcfe3d-fb49-4414-8061-5f544b6e9e42',
          componentName: 'qhzXHr',
          answered: false,
        },
      ],
    },
    {
      conditionId: '7a6dcb70-9403-4af4-a7e4-f77391a9f638',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
      ],
    },
    {
      conditionId: '3a596a83-aea4-450c-9aff-c5b05ac90d30',
      outcome: 'false',
      references: [
        {
          componentId: '522e1565-e74c-4ba9-8298-3ce52eaf421e',
          componentName: 'pRYrOW',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'f61b0145-3425-49d0-aaf3-e3498fc75096',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'ec0fe231-2633-4e11-80e0-9e40500b3a14',
      outcome: 'false',
      references: [
        {
          componentId: '96997a4f-bf75-4bb0-80f3-cbd147429977',
          componentName: 'vumpmr',
          answered: true,
        },
        {
          componentId: '0ab629e4-6a20-40d8-9334-5172d38e7aec',
          componentName: 'FsSpLA',
          answered: true,
        },
      ],
    },
    {
      conditionId: 'fa21211a-e356-4a5a-b67b-c2eda0ba5192',
      outcome: 'false',
      references: [
        {
          componentId: '0fe6e9dd-854f-425a-bda4-13d044a3e991',
          componentName: 'inlAzc',
          answered: false,
        },
      ],
    },
    {
      conditionId: '6d8c914e-8625-4270-832d-b1249bb8929e',
      outcome: 'false',
      references: [
        {
          componentId: '0fe6e9dd-854f-425a-bda4-13d044a3e991',
          componentName: 'inlAzc',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'a38ae109-85d1-47e3-b3dc-23f9658eabb3',
      outcome: 'false',
      references: [
        {
          componentId: '0fe6e9dd-854f-425a-bda4-13d044a3e991',
          componentName: 'inlAzc',
          answered: false,
        },
      ],
    },
    {
      conditionId: 'b7ac6fb1-7ec3-43f5-a479-7f4505273c2f',
      outcome: 'false',
      references: [
        {
          componentId: '0fe6e9dd-854f-425a-bda4-13d044a3e991',
          componentName: 'inlAzc',
          answered: false,
        },
      ],
    },
  ],
}

// const formMetaData = {
//   sessionId: '4132b3f8-10bf-4bf3-9e16-e7a7a37ec7d9',
//   retrievalKey: 'example-email-submission-recipient@defra.com',
//   referenceNumber: 'FN4-AHL-2AA',
//   meta: {
//     // Backend upserts on referenceNumber with $setOnInsert, so a fixed value means later sends are ignored
//     referenceNumber: `FN4-${Date.now().toString(36).toUpperCase()}`,
//     timestamp: new Date().toString()
//   },
//   data: {
//     main: {
//       yDwSNa: {
//         day: today.getDate(),
//         month: today.getMonth() + 1,
//         year: today.getFullYear()
//       }
//     }
//   }
// }

// const formMetaData = {
//   sessionId: '4132b3f8-10bf-4bf3-9e16-e7a7a37ec7d9',
//   retrievalKey: 'example-email-submission-recipient@defra.com',
//   referenceNumber: 'FN4-AHL-2AA',
//   meta: {
//     // Backend upserts on referenceNumber with $setOnInsert, so a fixed value means later sends are ignored
//     referenceNumber: `FN4-${Date.now().toString(36).toUpperCase()}`,
//     timestamp: new Date().toString()
//   },
//   data: {
//     main: {
//       yDwSNa: {
//         day: today.getDate(),
//         month: today.getMonth() + 1,
//         year: today.getFullYear()
//       }
//     }
//   }
// }

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
        ...formMetaData
      })
  }))

console.log('Dummy message sent to local Floci queue')
