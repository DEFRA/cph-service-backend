# Create CPH form field inventory (DEV)

## Source

- Source file: `file_apply-for-a-county-parish-holding-cph-number-dev-copy (1).json`
- Form name: "Apply for a county parish holding (CPH) number (dev copy)"
- Form version reported in the definition: `2` (`$.metadata["$$__formVersion"].versionNumber`)
- Schema version reported in the definition: `2` (`$.schema`)
- The definition contains no form ID.

## Scope and caveats

This is an inventory of the answer-producing components in the **DEV** Create definition. It is **not** an approved mapping to the CPH data model, and it does not guarantee that component names (submitted answer keys) are the same in other environments or form versions.

- Display-only components (`Html`, `Markdown`) are excluded.
- Question titles and short descriptions are reproduced exactly as they appear in the definition.
- "Line" is the line number of the component's `"name"` property in the source JSON.
- "Repeater" shows the repeater page's `repeat.options` name and title, where the field is on a repeater page.
- Components on `/upload-cattle-ear-tag-numbers-in-bulk` use a file upload page, not a repeater.

## Components

| # | Name | Title | Short description | Type | Page path | Line | Repeater | Notes |
|--|--|--|--|--|--|--|--|--|
| 1 | JGLmzy | Are you 18 or older? | Are you 18 or older? | YesNoField | /are-you-18-or-older | 21 |  |  |
| 2 | zcjEtV | Are you or your business already registered with the Rural Payments Agency? | Registered with the Rural Payments Agency | YesNoField | /are-you-or-your-business-already-registered-with-the-rural-payments-agency | 70 |  |  |
| 3 | aYjRCZ | What country will you keep livestock in? | Country where you will keep livestock | RadiosField | /what-country-will-you-keep-livestock-in | 99 |  |  |
| 4 | PTNfVG | What's your single business identifier (SBI)? | Single business identifier (SBI) | TextField | /whats-your-single-business-identifier-sbi | 140 |  |  |
| 5 | WHYPeQ | Do you know your customer reference number (CRN)? | Do you know your customer reference number (CRN)? | YesNoField | /do-you-know-your-customer-reference-number-crn | 165 |  |  |
| 6 | cMRAGl | What's your customer reference number (CRN)? | Customer reference number | TextField | /whats-your-customer-reference-number-crn | 187 |  |  |
| 7 | yDwSNa | What date will the livestock arrive? | What date will the livestock arrive? | DatePartsField | /arrival-date | 219 |  |  |
| 8 | vumpmr | What livestock will you keep? | Livestock you will keep | CheckboxesField | /what-livestock-will-you-keep | 260 |  |  |
| 9 | FsSpLA | Are you a hobbyist keeper or a business? | Are you a hobbyist keeper or a business? | RadiosField | /business-or-hobbyist | 365 |  |  |
| 10 | TKsWbP | Title | Title | TextField | /whats-the-name-of-the-applicant | 398 |  | Duplicate title; distinguish by page path. Free-text field; meaning (salutation or job title) not stated in the definition. |
| 11 | iyutEh | First name | First name | TextField | /whats-the-name-of-the-applicant | 411 |  | Duplicate title; distinguish by page path. |
| 12 | ByUqQW | Middle name | Middle name | TextField | /whats-the-name-of-the-applicant | 422 |  | Duplicate title; distinguish by page path. |
| 13 | GDYfTS | Last name | Last name | TextField | /whats-the-name-of-the-applicant | 435 |  | Duplicate title; distinguish by page path. |
| 14 | lWzdhw | What's the name of the business? | Business name | TextField | /whats-the-name-of-the-business | 457 |  |  |
| 15 | QvSFQU | Title | Title | TextField | /whats-your-name | 483 |  | Duplicate title; distinguish by page path. Free-text field; meaning (salutation or job title) not stated in the definition. |
| 16 | fGBFPv | First name | First name | TextField | /whats-your-name | 496 |  | Duplicate title; distinguish by page path. |
| 17 | BzFtpG | Middle name | Middle name | TextField | /whats-your-name | 508 |  | Duplicate title; distinguish by page path. |
| 18 | HEHgbQ | Last name | Last name | TextField | /whats-your-name | 521 |  | Duplicate title; distinguish by page path. |
| 19 | aEFhyW | What's your main phone number? | What's your main phone number? | TelephoneNumberField | /phone-numbers | 554 |  |  |
| 20 | tmSOkR | What's your second phone number? | What's your second phone number? | TelephoneNumberField | /phone-numbers | 564 |  |  |
| 21 | uZcVcc | What's your email address? | What's your email address? | EmailAddressField | /whats-your-email-address | 583 |  |  |
| 22 | SJmeaZ | What's your business address? | What's your business address? | UkAddressField | /business-address | 617 |  |  |
| 23 | LlcVhf | Is your business address the same as your home address? | Is your business address the same as your home address? | YesNoField | /business-address | 630 |  |  |
| 24 | hpmkrN | What's your home address? | What's your home address? | UkAddressField | /whats-your-home-address | 656 |  |  |
| 25 | BToHwu | Will you keep livestock at your home address? | Will you keep livestock at your home address? | YesNoField | /will-you-keep-livestock-at-your-home-address | 678 |  |  |
| 26 | yHQAol | What's the legal status of your business | What's the legal status of your business | RadiosField | /legal-status-of-your-business | 725 |  |  |
| 27 | MfzkDz | Business legal status: something else | Business legal status: something else | RadiosField | /legal-status-of-your-business-something-else | 766 |  |  |
| 28 | nNNsgO | What's your company number? | What's your company number? | TextField | /companies-house | 800 |  |  |
| 29 | ifygYY | What's your charity number? | What's your charity number? | NumberField | /charity-number | 837 |  |  |
| 30 | AoofuF | What is the main purpose of your business? | What is the main purpose of your business? | RadiosField | /what-is-the-main-purpose-of-your-business | 865 |  |  |
| 31 | luoxoh | What is the main purpose of your business: something else? | Main purpose of your business: something else | RadiosField | /what-is-the-main-purpose-of-your-business-something-else | 896 |  |  |
| 32 | hCxIFa | What type of business do you have? | What type of business do you have? | TextField | /what-type-of-business-do-you-have | 921 |  |  |
| 33 | RdCZhq | Will you keep livestock at your business address? | Will you keep livestock at your business address? | YesNoField | /will-you-keep-livestock-at-your-business-address | 941 |  |  |
| 34 | PXRMtw | What's the address where you'll keep livestock? | Address for livestock and animal by-products | UkAddressField | /whats-the-address-where-youll-keep-livestock | 968 |  |  |
| 35 | VkbHQu | Is your business a collection centre, market, showground or zoo? | Is your business a collection centre, market, showground or zoo? | RadiosField | /is-your-business-a-collection-centre-market-showground-or-zoo | 990 |  |  |
| 36 | UOmNur | What's the easting and northing for the area where you'll keep livestock? | Easting and northing for the area where you'll keep livestock | EastingNorthingField | /easting-and-northing-for-where-youll-keep-livestock | 1020 | hNCJCl (Location) |  |
| 37 | rOgnUv | Do you own the land? | Do you own the land? | YesNoField | /do-you-own-the-land | 1051 |  |  |
| 38 | qLmGSL | Is your tenancy agreement for more than one year? | Is your tenancy agreement for more than one year? | YesNoField | /is-your-tenancy-agreement-for-more-than-one-year | 1106 |  |  |
| 39 | uuQMUp | Does the landowner have a CPH number for the land? | Does the landowner have a CPH number for the land? | YesNoField | /does-the-landowner-have-a-cph-number-for-the-land | 1129 |  |  |
| 40 | iszBCF | Does your business have a second contact? | Business has a second contact | YesNoField | /does-your-business-have-a-second-contact | 1158 |  |  |
| 41 | yQiBlu | Do you want to add a second contact? | Second contact | YesNoField | /do-you-want-to-add-a-second-contact | 1188 |  |  |
| 42 | vCcTAU | Title | Title | TextField | /contact-details-of-the-second-contact | 1216 |  | Duplicate title; distinguish by page path. Free-text field; meaning (salutation or job title) not stated in the definition. |
| 43 | MtBoTP | First name of second contact | First name of second contact | TextField | /contact-details-of-the-second-contact | 1229 |  |  |
| 44 | QZNQVn | Middle name of second contact | Middle name of second contact | TextField | /contact-details-of-the-second-contact | 1242 |  |  |
| 45 | JdIhbf | Last name of second contact | Last name of second contact | TextField | /contact-details-of-the-second-contact | 1255 |  |  |
| 46 | RHkcga | Phone number of second contact | Phone number of second contact | TelephoneNumberField | /contact-details-of-the-second-contact | 1267 |  |  |
| 47 | JiLYDB | Email address of second contact | Email address of second contact | EmailAddressField | /contact-details-of-the-second-contact | 1279 |  |  |
| 48 | YnSTrb | Address for the second contact | Address for the second contact | UkAddressField | /contact-details-of-the-second-contact | 1293 |  |  |
| 49 | ledUEN | Do you want to tell the Rural Payments Agency anything else? | Anything else to tell the RPA | YesNoField | /do-you-want-to-tell-the-rural-payments-agency-anything-else | 1324 |  |  |
| 50 | JKtzeY | What do you want to tell us? | Additional information | MultilineTextField | /what-do-you-want-to-tell-us | 1349 |  |  |
| 51 | qIhSXZ | Do you intend to claim funding from the RPA? | Do you intend to claim funding from the RPA? | YesNoField | /rural-payments | 1379 |  |  |
| 52 | XBhudw | Are the contact details for the cattle keeper the same as the person applying for the CPH number? | Are the contact details for the cattle keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-cattle-keeper-the-same-as-the-person-applying-for-the-cph-number | 1415 |  |  |
| 53 | izZaaM | First and last name of the cattle keeper | First and last name of the cattle keeper | TextField | /contact-details-for-the-cattle-keeper | 1437 |  |  |
| 54 | HjoTVk | Email address of the cattle keeper | Email address of the cattle keeper | EmailAddressField | /contact-details-for-the-cattle-keeper | 1450 |  |  |
| 55 | daTXkI | Phone number of the cattle keeper | Phone number of the cattle keeper | TelephoneNumberField | /contact-details-for-the-cattle-keeper | 1463 |  |  |
| 56 | FzYNoF | Address of the cattle keeper | Address of the cattle keeper | UkAddressField | /contact-details-for-the-cattle-keeper | 1476 |  |  |
| 57 | onzgeq | What will the cattle mainly be used for? | What will the cattle mainly be used for? | RadiosField | /what-will-the-cattle-mainly-be-used-for | 1499 |  |  |
| 58 | UcbQWn | What is the primary business purpose for keeping cattle for beef? | What is the primary business purpose for keeping cattle for beef? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-cattle-for-beef | 1520 |  |  |
| 59 | hXmZJo | What is the primary business purpose for keeping cattle for dairy? | What is the primary business purpose for keeping cattle for dairy? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-cattle-for-dairy | 1541 |  |  |
| 60 | WlCAiG | How many cattle will you keep, on average? | How many cattle you will keep, on average | NumberField | /how-many-cattle-will-you-keep-on-average | 1564 |  |  |
| 61 | MiEhCV | Are the cattle already on site? | Are the cattle already on site? | YesNoField | /are-the-cattle-already-on-site | 1590 |  |  |
| 62 | xklZWO | How do you want to provide the ear tag numbers for cattle on your holding? | Cattle ear tag number format | RadiosField | /how-do-you-want-to-provide-the-ear-tag-numbers-for-cattle-on-your-holding | 1612 |  |  |
| 63 | npjytu | Upload cattle ear tag numbers in bulk spreadsheet | Bulk cattle ear tag numbers | FileUploadField | /upload-cattle-ear-tag-numbers-in-bulk | 1643 |  |  |
| 64 | rRsWzb | What is the ear tag number for this animal? | What is the ear tag number for this animal? | TextField | /ear-tags-for-cattle-on-site | 1683 | tqotaE (Ear tag) |  |
| 65 | PYZdaO | What date did this animal move onto your holding? | What date did this animal move onto your holding? | DatePartsField | /ear-tags-for-cattle-on-site | 1693 | tqotaE (Ear tag) |  |
| 66 | CeHUdX | Do you have any other cattle herds? | Do you have any other cattle herds? | YesNoField | /do-you-have-any-other-cattle-herds | 1713 |  |  |
| 67 | yJicSW | Do you want to synchronise TB testing? | Do you want to synchronise TB testing? | YesNoField | /do-you-want-to-synchronise-tb-testing | 1733 |  |  |
| 68 | XkUCYq | What veterinary practice do you use for TB testing? | What veterinary practice do you use for TB testing? | TextField | /what-veterinary-practice-do-you-use-for-tb-testing | 1755 |  |  |
| 69 | rypJGc | What's the address of your veterinary practice? | What's the address of your veterinary practice? | UkAddressField | /whats-the-address-of-your-veterinary-practice | 1778 |  |  |
| 70 | VnBKgk | What is the most effective time of the year for TB testing? | What is the most effective time of the year for TB testing? | CheckboxesField | /what-is-the-most-effective-time-of-the-year-for-tb-testing | 1801 |  |  |
| 71 | hSjgMw | What reporting service will you use? | What reporting service will you use? | RadiosField | /what-reporting-service-will-you-use | 1824 |  |  |
| 72 | oDyRmj | What type of camelids do you keep? | Type of camelids you keep | CheckboxesField | /what-type-of-camelids-do-you-keep | 1863 |  |  |
| 73 | CqBerI | Are the contact details for the guanaco keeper the same as the person applying for the CPH number? | Are the contact details for the guanaco keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-guanaco-keeper-the-same-as-the-person-applying-for-the-cph-number | 1886 |  |  |
| 74 | ijZETo | First and last name of the guanaco keeper | First and last name of the guanaco keeper | TextField | /contact-details-for-the-guanaco-keeper | 1908 |  |  |
| 75 | NLaKpI | Email address of the guanaco keeper | Email address of the guanaco keeper | EmailAddressField | /contact-details-for-the-guanaco-keeper | 1921 |  |  |
| 76 | bMKTFS | Phone number of the guanaco keeper | Phone number of the guanaco keeper | TelephoneNumberField | /contact-details-for-the-guanaco-keeper | 1934 |  |  |
| 77 | QvHcdC | Address of the guanaco keeper | Address of the guanaco keeper | UkAddressField | /contact-details-for-the-guanaco-keeper | 1947 |  |  |
| 78 | GDxAvD | What will the guanaco mainly be used for? | What will the guanaco mainly be used for? | RadiosField | /what-will-the-guanaco-mainly-be-used-for | 1970 |  |  |
| 79 | AeUDUP | How many guanacos will you keep, on average? | How many guanacos you will keep, on average | NumberField | /how-many-guanacos-will-you-keep-on-average | 1993 |  |  |
| 80 | VoTgVE | Are the contact details for the vicuna keeper the same as the person applying for the CPH number? | Are the contact details for the vicuna keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-vicuna-keeper-the-same-as-the-person-applying-for-the-cph-number | 2020 |  |  |
| 81 | GccmVi | First and last name of the vicuna keeper | First and last name of the vicuna keeper | TextField | /contact-details-for-the-vicuna-keeper | 2042 |  |  |
| 82 | DvcLJn | Email address of the vicuna keeper | Email address of the vicuna keeper | EmailAddressField | /contact-details-for-the-vicuna-keeper | 2055 |  |  |
| 83 | lxpJof | Phone number of the vicuna keeper | Phone number of the vicuna keeper | TelephoneNumberField | /contact-details-for-the-vicuna-keeper | 2068 |  |  |
| 84 | BGtQTK | Address of the vicuna keeper | Address of the vicuna keeper | UkAddressField | /contact-details-for-the-vicuna-keeper | 2081 |  |  |
| 85 | uJsejr | What will the vicuna mainly be used for? | What will the vicuna mainly be used for? | RadiosField | /what-will-the-vicuna-mainly-be-used-for | 2104 |  |  |
| 86 | thGZuG | How many vicunas will you keep, on average? | How many vicunas you will keep, on average | NumberField | /how-many-vicunas-will-you-keep-on-average | 2127 |  |  |
| 87 | zdhOGu | Are the contact details for the llama keeper the same as the person applying for the CPH number? | Are the contact details for the llama keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-llama-keeper-the-same-as-the-person-applying-for-the-cph-number | 2154 |  |  |
| 88 | EqDULM | First and last name of the llama keeper | First and last name of the llama keeper | TextField | /contact-details-for-the-llama-keeper | 2176 |  |  |
| 89 | cNxxHU | Email address of the llama keeper | Email address of the llama keeper | EmailAddressField | /contact-details-for-the-llama-keeper | 2189 |  |  |
| 90 | DFtKmz | Phone number of the llama keeper | Phone number of the llama keeper | TelephoneNumberField | /contact-details-for-the-llama-keeper | 2202 |  |  |
| 91 | yfeRbv | Address of the llama keeper | Address of the llama keeper | UkAddressField | /contact-details-for-the-llama-keeper | 2215 |  |  |
| 92 | sUjwlm | What will the llama mainly be used for? | What will the llama mainly be used for? | RadiosField | /what-will-the-llama-mainly-be-used-for | 2238 |  |  |
| 93 | nLmAsw | How many llamas will you keep, on average? | How many llamas you will keep, on average | NumberField | /how-many-llamas-will-you-keep-on-average | 2261 |  |  |
| 94 | CsoIbB | Are the contact details for the alpaca keeper the same as the person applying for the CPH number? | Are the contact details for the alpaca keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-alpaca-keeper-the-same-as-the-person-applying-for-the-cph-number | 2288 |  |  |
| 95 | ztmeuu | First and last name of the alpaca keeper | First and last name of the alpaca keeper | TextField | /contact-details-for-the-alpaca-keeper | 2310 |  |  |
| 96 | mXmRhz | Email address of the alpaca keeper | Email address of the alpaca keeper | EmailAddressField | /contact-details-for-the-alpaca-keeper | 2323 |  |  |
| 97 | naUWMU | Phone number of the alpaca keeper | Phone number of the alpaca keeper | TelephoneNumberField | /contact-details-for-the-alpaca-keeper | 2336 |  |  |
| 98 | RhikEx | Address of the alpaca keeper | Address of the alpaca keeper | UkAddressField | /contact-details-for-the-alpaca-keeper | 2349 |  |  |
| 99 | XgjeJx | What will the alpaca mainly be used for? | What will the alpaca mainly be used for? | RadiosField | /what-will-the-alpaca-mainly-be-used-for | 2372 |  |  |
| 100 | dYvDoH | How many alpacas will you keep, on average? | How many alpacas you will keep, on average | NumberField | /how-many-alpacas-will-you-keep-on-average | 2395 |  |  |
| 101 | CmgQhq | What 'other' camelids do you keep? | What 'other' camelids do you keep? | MultilineTextField | /what-other-camelids-do-you-keep | 2422 |  |  |
| 102 | VlpbyJ | Are the contact details for the 'other' camelid keeper the same as the person applying for the CPH number? | Are the contact details for the 'other' camelid keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-other-camelid-keeper-the-same-as-the-person-applying-for-the-cph-number | 2445 |  |  |
| 103 | NYdWej | First and last name of the 'other' camelid keeper | First and last name of the 'other' camelid keeper | TextField | /contact-details-for-the-other-camelid-keeper | 2467 |  |  |
| 104 | oZzlkg | Email address of the 'other' camelid keeper | Email address of the 'other' camelid keeper | EmailAddressField | /contact-details-for-the-other-camelid-keeper | 2480 |  |  |
| 105 | KKiCNb | Phone number of the 'other' camelid keeper | Phone number of the 'other' camelid keeper | TelephoneNumberField | /contact-details-for-the-other-camelid-keeper | 2493 |  |  |
| 106 | TsvVBS | Address of the 'other' camelid keeper | Address of the 'other' camelid keeper | UkAddressField | /contact-details-for-the-other-camelid-keeper | 2506 |  |  |
| 107 | Frbekp | What will the 'other' camelids mainly be used for? | What will the 'other' camelids mainly be used for? | RadiosField | /what-will-the-other-camelids-mainly-be-used-for | 2529 |  |  |
| 108 | AnFOuT | How many 'other' camelids will you keep, on average? | How many 'other' camelids you will keep, on average | NumberField | /how-many-other-camelids-will-you-keep-on-average | 2552 |  |  |
| 109 | FKoeLJ | Are the contact details for the sheep keeper the same as the person applying for the CPH number? | Are the contact details for the sheep keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-sheep-keeper-the-same-as-the-person-applying-for-the-cph-number | 2598 |  |  |
| 110 | uJpEEl | First and last name of the sheep keeper | First and last name of the sheep keeper | TextField | /contact-details-for-the-sheep-keeper | 2620 |  |  |
| 111 | ILtGqv | Email address of the sheep keeper | Email address of the sheep keeper | EmailAddressField | /contact-details-for-the-sheep-keeper | 2633 |  |  |
| 112 | gkLqsa | Phone number of the sheep keeper | Phone number of the sheep keeper | TelephoneNumberField | /contact-details-for-the-sheep-keeper | 2646 |  |  |
| 113 | Icuwit | Address of the sheep keeper | Address of the sheep keeper | UkAddressField | /contact-details-for-the-sheep-keeper | 2659 |  |  |
| 114 | mGpfRt | What will the sheep mainly be used for? | What will the sheep mainly be used for? | RadiosField | /what-will-the-sheep-mainly-be-used-for | 2682 |  |  |
| 115 | CCncrO | What is the primary business purpose for keeping sheep for dairy? | What is the primary business purpose for keeping sheep for dairy? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-sheep-for-dairy | 2703 |  |  |
| 116 | snUitY | What is the primary business purpose for keeping sheep for meat? | What is the primary business purpose for keeping sheep for meat? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-sheep-for-meat | 2724 |  |  |
| 117 | AKVTnD | What is the primary business purpose for keeping sheep for the production of other products? | What is the primary business purpose for keeping sheep for the production of other products? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-sheep-for-the-production-of-other-products | 2745 |  |  |
| 118 | rWcyjk | How many sheep will you keep, on average? | How many sheep you will keep, on average | NumberField | /how-many-sheep-will-you-keep-on-average | 2768 |  |  |
| 119 | PJddbU | Are the contact details for the pig keeper the same as the person applying for the CPH number? | Are the contact details for the pig keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-pig-keeper-the-same-as-the-person-applying-for-the-cph-number | 2812 |  |  |
| 120 | OulKDW | First and last name of the pig keeper | First and last name of the pig keeper | TextField | /contact-details-for-the-pig-keeper | 2834 |  |  |
| 121 | GYyKEv | Email address of the pig keeper | Email address of the pig keeper | EmailAddressField | /contact-details-for-the-pig-keeper | 2847 |  |  |
| 122 | IlEYTL | Phone number of the pig keeper | Phone number of the pig keeper | TelephoneNumberField | /contact-details-for-the-pig-keeper | 2860 |  |  |
| 123 | GQxaxc | Address of the pig keeper | Address of the pig keeper | UkAddressField | /contact-details-for-the-pig-keeper | 2873 |  |  |
| 124 | WGOZNo | What will the pigs mainly be used for? | What will the pigs mainly be used for? | RadiosField | /what-will-the-pigs-mainly-be-used-for | 2896 |  |  |
| 125 | SuzlWb | What is the primary business purpose for keeping pigs non commercially? | What is the primary business purpose for keeping pigs non commercially? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-pigs-non-commercially | 2919 |  |  |
| 126 | wayKLY | What is the primary business purpose for keeping pigs commercially? | What is the primary business purpose for keeping pigs commercially? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-pigs-commercially | 2942 |  |  |
| 127 | vwVNWp | What is the primary business purpose for keeping pigs for the production of other products? | What is the primary business purpose for keeping pigs for the production of other products? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-pigs-for-the-production-of-other-products | 2963 |  |  |
| 128 | MynCBH | How many pigs will you keep, on average? | How many pigs you will keep, on average | NumberField | /how-many-pigs-will-you-keep-on-average | 2986 |  |  |
| 129 | fjzFss | Are the contact details for the goat keeper the same as the person applying for the CPH number? | Are the contact details for the goat keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-goat-keeper-the-same-as-the-person-applying-for-the-cph-number | 3030 |  |  |
| 130 | FRfFLX | First and last name of the goat keeper | First and last name of the goat keeper | TextField | /contact-details-for-the-goat-keeper | 3052 |  |  |
| 131 | ssWXuf | Email address of the goat keeper | Email address of the goat keeper | EmailAddressField | /contact-details-for-the-goat-keeper | 3065 |  |  |
| 132 | eNzzAh | Phone number of the goat keeper | Phone number of the goat keeper | TelephoneNumberField | /contact-details-for-the-goat-keeper | 3078 |  |  |
| 133 | XCldVK | Address of the goat keeper | Address of the goat keeper | UkAddressField | /contact-details-for-the-goat-keeper | 3091 |  |  |
| 134 | wQpKqo | What will the goats mainly be used for? | What will the goats mainly be used for? | RadiosField | /what-will-the-goats-mainly-be-used-for | 3114 |  |  |
| 135 | pgWjzJ | What is the primary business purpose for keeping goats for dairy? | What is the primary business purpose for keeping goats for dairy? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-goats-for-dairy | 3137 |  |  |
| 136 | YcIjOE | What is the primary business purpose for keeping goats for meat? | What is the primary business purpose for keeping goats for meat? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-goats-for-meat | 3160 |  |  |
| 137 | ptkmAr | What is the primary business purpose for keeping goats for the production of other products? | What is the primary business purpose for keeping goats for the production of other products? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-goats-for-the-production-of-other-products | 3183 |  |  |
| 138 | njpWWm | How many goats will you keep, on average? | How many goats you will keep, on average | NumberField | /how-many-goats-will-you-keep-on-average | 3206 |  |  |
| 139 | eltlsp | Are the contact details for the deer keeper the same as the person applying for the CPH number? | Are the contact details for the deer keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-deer-keeper-the-same-as-the-person-applying-for-the-cph-number | 3250 |  |  |
| 140 | kJXcgL | First and last name of the deer keeper | First and last name of the deer keeper | TextField | /contact-details-for-the-deer-keeper | 3272 |  |  |
| 141 | ClcjwZ | Email address of the deer keeper | Email address of the deer keeper | EmailAddressField | /contact-details-for-the-deer-keeper | 3285 |  |  |
| 142 | zroAeq | Phone number of the deer keeper | Phone number of the deer keeper | TelephoneNumberField | /contact-details-for-the-deer-keeper | 3298 |  |  |
| 143 | bvxrLa | Address of the deer keeper | Address of the deer keeper | UkAddressField | /contact-details-for-the-deer-keeper | 3311 |  |  |
| 144 | XjUQci | What will the deer mainly be used for? | What will the deer mainly be used for? | RadiosField | /what-will-the-deer-mainly-be-used-for | 3334 |  |  |
| 145 | SuocmJ | What is the primary business purpose for keeping deer for the production of other products? | What is the primary business purpose for keeping deer for the production of other products? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-deer-for-the-production-of-other-products | 3355 |  |  |
| 146 | YvnJbu | How many deer will you keep, on average? | How many deer you will keep, on average | NumberField | /how-many-deer-will-you-keep-on-average | 3378 |  |  |
| 147 | MmECpG | What type of poultry do you keep? | What type of poultry do you keep? | CheckboxesField | /what-type-of-poultry-do-you-keep | 3403 |  |  |
| 148 | EzXmBh | Are the contact details for the chicken keeper the same as the person applying for the CPH number? | Are the contact details for the chicken keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-chicken-keeper-the-same-as-the-person-applying-for-the-cph-number | 3426 |  |  |
| 149 | PaMMmm | First and last name of the chicken keeper | First and last name of the chicken keeper | TextField | /contact-details-for-the-chicken-keeper | 3448 |  |  |
| 150 | UbJaUI | Email address of the chicken keeper | Email address of the chicken keeper | EmailAddressField | /contact-details-for-the-chicken-keeper | 3461 |  |  |
| 151 | wRXKrb | Phone number of the chicken keeper | Phone number of the chicken keeper | TelephoneNumberField | /contact-details-for-the-chicken-keeper | 3474 |  |  |
| 152 | QMSznE | Address of the chicken keeper | Address of the chicken keeper | UkAddressField | /contact-details-for-the-chicken-keeper | 3487 |  |  |
| 153 | VvGlrl | How many chickens do you keep? | How many chickens do you keep? | NumberField | /how-many-chickens-do-you-keep | 3508 |  |  |
| 154 | aElsXF | What will you mainly use the chickens for? | What will you mainly use the chickens for? | RadiosField | /what-will-you-mainly-use-the-chickens-for | 3529 |  |  |
| 155 | lsFcPe | What will the chickens mainly be used for? | What will the chickens mainly be used for? | RadiosField | /what-will-the-chickens-mainly-be-used-for | 3553 |  |  |
| 156 | wFMPgJ | What is the primary business purpose for keeping chickens for meat? | What is the primary business purpose for keeping chickens for meat? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-chickens-for-meat | 3576 |  |  |
| 157 | qcPxgz | What is the primary business purpose for keeping chickens as a backyard flock? | What is the primary business purpose for keeping chickens as a backyard flock? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-chickens-as-a-backyard-flock | 3599 |  |  |
| 158 | hXNPMg | What is the primary business purpose for keeping chickens for egg laying? | What is the primary business purpose for keeping chickens for egg laying? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-chickens-for-egg-laying | 3622 |  |  |
| 159 | wexLsj | What is the primary business purpose for keeping chickens for the production of other products? | What is the primary business purpose for keeping chickens for the production of other products? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-chickens-for-the-production-of-other-products | 3643 |  |  |
| 160 | cgMeCw | What farm management system do you use to keep chickens? | What farm management system do you use to keep chickens? | RadiosField | /what-farm-management-system-do-you-use-to-keep-chickens | 3664 |  |  |
| 161 | Mqkuji | When do you stock chickens? | When do you stock chickens? | CheckboxesField | /when-do-you-stock-chickens | 3685 |  |  |
| 162 | kGrVCW | Where are your chickens housed? | Where are your chickens housed? | RadiosField | /where-are-your-chickens-housed | 3706 |  |  |
| 163 | BjPWRG | Do the chickens have access to open air? | Do the chickens have access to open air? | YesNoField | /do-the-chickens-have-access-to-open-air | 3727 |  |  |
| 164 | EKfseX | Are the contact details for the geese keeper the same as the person applying for a CPH number? | Are the contact details for the geese keeper the same as the person applying for a CPH number? | YesNoField | /are-the-contact-details-for-the-geese-keeper-the-same-as-the-person-applying-for-a-cph-number | 3768 |  |  |
| 165 | voPZEq | First and last name of the geese keeper | First and last name of the geese keeper | TextField | /contact-details-for-the-geese-keeper | 3790 |  |  |
| 166 | weWZei | Email address of the geese keeper | Email address of the geese keeper | EmailAddressField | /contact-details-for-the-geese-keeper | 3803 |  |  |
| 167 | YQTMHm | Phone number of the geese keeper | Phone number of the geese keeper | TelephoneNumberField | /contact-details-for-the-geese-keeper | 3816 |  |  |
| 168 | NXSjoA | Address of the geese keeper | Address of the geese keeper | UkAddressField | /contact-details-for-the-geese-keeper | 3827 |  |  |
| 169 | njNXnw | How many geese do you keep? | How many geese do you keep? | NumberField | /how-many-geese-do-you-keep | 3849 |  |  |
| 170 | nRtZKJ | What will you mainly use the geese for? | Main use for keeping geese | RadiosField | /what-will-you-mainly-use-the-geese-for | 3870 |  |  |
| 171 | tNhLIa | What will the geese mainly be used for? | What will the geese mainly be used for? | RadiosField | /what-will-the-geese-mainly-be-used-for | 3892 |  |  |
| 172 | ziwxsD | What is the primary business purpose for keeping geese for meat? | What is the primary business purpose for keeping geese for meat? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-geese-for-meat | 3913 |  |  |
| 173 | hbVwdK | What is the primary business purpose for keeping geese for egg laying? | What is the primary business purpose for keeping geese for egg laying? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-geese-for-egg-laying | 3934 |  |  |
| 174 | HPdnTq | What is the primary business purpose for keeping a backyard flock of geese? | What is the primary business purpose for keeping a backyard flock of geese? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-a-backyard-flock-of-geese | 3955 |  |  |
| 175 | PywEMT | What is the primary business purpose for keeping geese for showing? | What is the primary business purpose for keeping geese for showing? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-geese-for-showing | 3976 |  |  |
| 176 | tNHklA | What is the primary business purpose for keeping geese for shooting? | What is the primary business purpose for keeping geese for shooting? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-geese-for-shooting | 3997 |  |  |
| 177 | kUahIK | What farm management system do you use to keep geese? | What farm management system do you use to keep geese? | RadiosField | /what-farm-management-system-do-you-use-to-keep-geese | 4018 |  |  |
| 178 | nrgJup | When do you stock geese? | When do you stock geese? | CheckboxesField | /when-do-you-stock-geese | 4039 |  |  |
| 179 | CxOSdK | Where are your geese housed? | Where are your geese housed? | RadiosField | /where-are-your-geese-housed | 4060 |  |  |
| 180 | QsLUsn | Do the geese have access to open air? | Do the geese have access to open air? | YesNoField | /do-the-geese-have-access-to-open-air | 4081 |  |  |
| 181 | yxpYiH | Are the contact details for the duck keeper the same as the person applying for the CPH number? | Are the contact details for the duck keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-duck-keeper-the-same-as-the-person-applying-for-the-cph-number | 4122 |  |  |
| 182 | aWUaIg | First and last name of the duck keeper | First and last name of the duck keeper | TextField | /contact-details-for-the-duck-keeper | 4144 |  |  |
| 183 | GLQzEw | Email address of the duck keeper | Email address of the duck keeper | EmailAddressField | /contact-details-for-the-duck-keeper | 4157 |  |  |
| 184 | eOlTcH | Phone number of the duck keeper | Phone number of the duck keeper | TelephoneNumberField | /contact-details-for-the-duck-keeper | 4170 |  |  |
| 185 | TwDFQi | Address of the duck keeper | Address of the duck keeper | UkAddressField | /contact-details-for-the-duck-keeper | 4183 |  |  |
| 186 | DGVWgw | How many ducks do you keep? | How many ducks do you keep? | NumberField | /how-many-ducks-do-you-keep | 4206 |  |  |
| 187 | XLadVr | What will you mainly use the ducks for? | Main use for keeping ducks | RadiosField | /what-will-you-mainly-use-the-ducks-for | 4230 |  |  |
| 188 | JoIUrK | What will the ducks mainly be used for? | What will the ducks mainly be used for? | RadiosField | /what-will-the-ducks-mainly-be-used-for | 4252 |  |  |
| 189 | WGsGFF | What is the primary business purpose for keeping ducks for meat? | What is the primary business purpose for keeping ducks for meat? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-ducks-for-meat | 4273 |  |  |
| 190 | gnAiRf | What is the primary business purpose for keeping ducks for egg laying? | What is the primary business purpose for keeping ducks for egg laying? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-ducks-for-egg-laying | 4294 |  |  |
| 191 | hTBvOn | What is the primary business purpose for keeping a backyard flock of ducks? | What is the primary business purpose for keeping a backyard flock of ducks? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-a-backyard-flock-of-ducks | 4315 |  |  |
| 192 | xbTfhk | What is the primary business purpose for keeping ducks for showing? | What is the primary business purpose for keeping ducks for showing? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-ducks-for-showing | 4336 |  |  |
| 193 | SrtRMN | What is the primary business purpose for keeping ducks for shooting? | What is the primary business purpose for keeping ducks for shooting? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-ducks-for-shooting | 4357 |  |  |
| 194 | RxkHrO | What farm management system do you use to keep ducks? | What farm management system do you use to keep ducks? | RadiosField | /what-farm-management-system-do-you-use-to-keep-ducks | 4378 |  |  |
| 195 | gompqp | When do you stock ducks? | When do you stock ducks? | CheckboxesField | /when-do-you-stock-ducks | 4399 |  |  |
| 196 | VjfPEB | Where are your ducks housed? | Where are your ducks housed? | RadiosField | /where-are-your-ducks-housed | 4422 |  |  |
| 197 | WIFZHC | Do the ducks have access to open air? | Do the ducks have access to open air? | YesNoField | /do-the-ducks-have-access-to-open-air | 4443 |  |  |
| 198 | NdkRyY | Are the contact details for the guinea fowl keeper the same as the person applying for the CPH number? | Are the contact details for the guinea fowl keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-guinea-fowl-keeper-the-same-as-the-person-applying-for-the-cph-number | 4484 |  |  |
| 199 | XcBymC | First and last name of the guinea fowl keeper | First and last name of the guinea fowl keeper | TextField | /contact-details-for-the-guinea-fowl-keeper | 4506 |  |  |
| 200 | sGsraO | Email address of the guinea fowl keeper | Email address of the guinea fowl keeper | EmailAddressField | /contact-details-for-the-guinea-fowl-keeper | 4519 |  |  |
| 201 | wIVYKO | Phone number of the guinea fowl keeper | Phone number of the guinea fowl keeper | TelephoneNumberField | /contact-details-for-the-guinea-fowl-keeper | 4532 |  |  |
| 202 | XKkIiQ | Address of the guinea fowl keeper | Address of the guinea fowl keeper | UkAddressField | /contact-details-for-the-guinea-fowl-keeper | 4545 |  |  |
| 203 | NqdmQZ | How many guinea fowl do you keep? | How many guinea fowl do you keep? | NumberField | /how-many-guinea-fowl-do-you-keep | 4568 |  |  |
| 204 | Bmjmdz | What will you mainly use the guinea fowl for? | Main use for keeping guinea fowl | RadiosField | /what-will-you-mainly-use-the-guinea-fowl-for | 4592 |  |  |
| 205 | sPenlz | What will the guinea fowl mainly be used for? | What will the guinea fowl mainly be used for? | RadiosField | /what-will-the-guinea-fowl-mainly-be-used-for | 4614 |  |  |
| 206 | fcjSip | What is the primary business purpose for keeping guinea fowl for meat? | What is the primary business purpose for keeping guinea fowl for meat? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-guinea-fowl-for-meat | 4635 |  |  |
| 207 | aumhtC | What is the primary business purpose for keeping a backyard flock of guinea fowl? | What is the primary business purpose for keeping a backyard flock of guinea fowl? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-a-backyard-flock-of-guinea-fowl | 4656 |  |  |
| 208 | HhOBXM | What farm management system do you use to keep guinea fowl? | What farm management system do you use to keep guinea fowl? | RadiosField | /what-farm-management-system-do-you-use-to-keep-guinea-fowl | 4677 |  |  |
| 209 | OeHxam | When do you stock guinea fowl? | When do you stock guinea fowl? | CheckboxesField | /when-do-you-stock-guinea-fowl | 4698 |  |  |
| 210 | vfSGvJ | Where are your guinea fowl housed? | Where are your guinea fowl housed? | RadiosField | /where-are-your-guinea-fowl-housed | 4719 |  |  |
| 211 | NwDubD | Do the guinea fowl have access to open air? | Do the guinea fowl have access to open air? | YesNoField | /do-the-guinea-fowl-have-access-to-open-air | 4740 |  |  |
| 212 | kxtWQb | Are the contact details for the pheasant keeper the same as the person applying for the CPH number? | Are the contact details for the pheasant keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-pheasant-keeper-the-same-as-the-person-applying-for-the-cph-number | 4783 |  |  |
| 213 | pbgtmc | First and last name of the pheasant keeper | First and last name of the pheasant keeper | TextField | /contact-details-for-the-pheasant-keeper | 4805 |  |  |
| 214 | kNjXSi | Email address of the pheasant keeper | Email address of the pheasant keeper | EmailAddressField | /contact-details-for-the-pheasant-keeper | 4818 |  |  |
| 215 | SOwhuo | Phone number of the pheasant keeper | Phone number of the pheasant keeper | TelephoneNumberField | /contact-details-for-the-pheasant-keeper | 4829 |  |  |
| 216 | XAnZcI | Address of the pheasant keeper | Address of the pheasant keeper | UkAddressField | /contact-details-for-the-pheasant-keeper | 4841 |  |  |
| 217 | SfsSLp | How many pheasants do you keep? | How many pheasants do you keep? | NumberField | /how-many-pheasants-do-you-keep | 4864 |  |  |
| 218 | VmpCVY | What will you mainly use the pheasants for? | Main use for keeping pheasants | RadiosField | /what-will-you-mainly-use-the-pheasants-for | 4888 |  |  |
| 219 | JycUWJ | What will the pheasants mainly be used for? | What will the pheasants mainly be used for? | RadiosField | /what-will-the-pheasants-mainly-be-used-for | 4910 |  |  |
| 220 | PaApVb | What is the primary business purpose for keeping pheasants for meat? | What is the primary business purpose for keeping pheasants for meat? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-pheasants-for-meat | 4931 |  |  |
| 221 | nvvwUq | What is the primary business purpose for keeping a backyard flock of pheasants? | What is the primary business purpose for keeping a backyard flock of pheasants? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-a-backyard-flock-of-pheasants | 4952 |  |  |
| 222 | KALQVd | What is the primary business purpose for keeping pheasants for shooting? | What is the primary business purpose for keeping pheasants for shooting? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-pheasants-for-shooting | 4973 |  |  |
| 223 | RGSPOy | What farm management system do you use to keep pheasants? | What farm management system do you use to keep pheasants? | RadiosField | /what-farm-management-system-do-you-use-to-keep-pheasants | 4994 |  |  |
| 224 | qhLgZp | When do you stock pheasants? | When do you stock pheasants? | CheckboxesField | /when-do-you-stock-pheasants | 5015 |  |  |
| 225 | OaWOSz | Where are your pheasants housed? | Where are your pheasants housed? | RadiosField | /where-are-your-pheasants-housed | 5036 |  |  |
| 226 | NHMCAw | Do the pheasants have access to open air? | Do the pheasants have access to open air? | YesNoField | /do-the-pheasants-have-access-to-open-air | 5057 |  |  |
| 227 | OsvyLJ | Are the contact details for the partridge keeper the same as the person applying for the CPH number? | Are the contact details for the partridge keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-partridge-keeper-the-same-as-the-person-applying-for-the-cph-number | 5100 |  |  |
| 228 | WlyulY | First and last name of the partridge keeper | First and last name of the partridge keeper | TextField | /contact-details-for-the-partridge-keeper | 5122 |  |  |
| 229 | ElhlwF | Email address of the partridge keeper | Email address of the partridge keeper | EmailAddressField | /contact-details-for-the-partridge-keeper | 5135 |  |  |
| 230 | vRIkgY | Phone number of the partridge keeper | Phone number of the partridge keeper | TelephoneNumberField | /contact-details-for-the-partridge-keeper | 5148 |  |  |
| 231 | VmwfDM | Address of the partridge keeper | Address of the partridge keeper | UkAddressField | /contact-details-for-the-partridge-keeper | 5161 |  |  |
| 232 | MPkYfI | How many partridges do you keep? | How many partridges do you keep? | NumberField | /how-many-partridges-do-you-keep | 5184 |  |  |
| 233 | VbuHPR | What will you mainly use the partridges for? | Main use for keeping partridges | RadiosField | /what-will-you-mainly-use-the-partridges-for | 5208 |  |  |
| 234 | FDoZpx | What will the partridges mainly be used for? | What will the partridges mainly be used for? | RadiosField | /what-will-the-partridges-mainly-be-used-for | 5230 |  |  |
| 235 | NANWVy | What is the primary business purpose for keeping partridges for meat? | What is the primary business purpose for keeping partridges for meat? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-partridges-for-meat | 5251 |  |  |
| 236 | mCawjs | What is the primary business purpose for keeping a backyard flock of partridges? | What is the primary business purpose for keeping a backyard flock of partridges? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-a-backyard-flock-of-partridges | 5272 |  |  |
| 237 | xGcfUV | What is the primary business purpose for keeping partridges for shooting? | What is the primary business purpose for keeping partridges for shooting? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-partridges-for-shooting | 5293 |  |  |
| 238 | vRYQcC | What farm management system do you use to keep partridges? | What farm management system do you use to keep partridges? | RadiosField | /what-farm-management-system-do-you-use-to-keep-partridges | 5314 |  |  |
| 239 | PTqcdG | When do you stock partridges? | When do you stock partridges? | CheckboxesField | /when-do-you-stock-partridges | 5335 |  |  |
| 240 | fliMJN | Where are your partridges housed? | Where are your partridges housed? | RadiosField | /where-are-your-partridges-housed | 5356 |  |  |
| 241 | jWeVEG | Do the partridges have access to open air? | Do the partridges have access to open air? | YesNoField | /do-the-partridges-have-access-to-open-air | 5377 |  |  |
| 242 | pRYrOW | Are the contact details for the pigeon keeper the same as the CPH number contact details? | Are the contact details for the pigeon keeper the same as the CPH number contact details? | YesNoField | /are-the-contact-details-for-the-pigeon-keeper-the-same-as-the-cph-number-contact-details | 5417 |  |  |
| 243 | DlpVnw | First and last name of the pigeon keeper | First and last name of the pigeon keeper | TextField | /contact-details-for-the-pigeon-keeper | 5439 |  |  |
| 244 | eNnhPB | Email address of the pigeon keeper | Email address of the pigeon keeper | EmailAddressField | /contact-details-for-the-pigeon-keeper | 5452 |  |  |
| 245 | koCHLO | Phone number of the pigeon keeper | Phone number of the pigeon keeper | TelephoneNumberField | /contact-details-for-the-pigeon-keeper | 5465 |  |  |
| 246 | meWrfj | Address of the pigeon keeper | Address of the pigeon keeper | UkAddressField | /contact-details-for-the-pigeon-keeper | 5478 |  |  |
| 247 | kzSvZE | How many pigeons do you keep? | How many pigeons do you keep? | NumberField | /how-many-pigeons-do-you-keep | 5501 |  |  |
| 248 | GXtnXx | What will you mainly use the pigeons for? | What will you mainly use the pigeons for? | RadiosField | /what-will-you-mainly-use-the-pigeons-for | 5526 |  |  |
| 249 | inlAzc | What will the pigeons mainly be used for? | What will the pigeons mainly be used for? | RadiosField | /what-will-the-pigeons-mainly-be-used-for | 5549 |  |  |
| 250 | CdLKWw | What is the primary business purpose for keeping a backyard flock of pigeons? | What is the primary business purpose for keeping a backyard flock of pigeons? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-a-backyard-flock-of-pigeons | 5572 |  |  |
| 251 | slvEvB | What is the primary business purpose for keeping pigeons for racing? | What is the primary business purpose for keeping pigeons for racing? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-pigeons-for-racing | 5595 |  |  |
| 252 | wnKlqr | What is the primary business purpose for keeping pigeons for shooting? | What is the primary business purpose for keeping pigeons for shooting? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-pigeons-for-shooting | 5618 |  |  |
| 253 | YWcHXX | What is the primary business purpose for keeping pigeons for showing? | What is the primary business purpose for keeping pigeons for showing? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-pigeons-for-showing | 5641 |  |  |
| 254 | WcBLKV | When do you stock pigeons? | When do you stock pigeons? | CheckboxesField | /when-do-you-stock-pigeons | 5664 |  |  |
| 255 | OpSrdf | Are the contact details for the turkey keeper the same as the person applying for the CPH number? | Are the contact details for the turkey keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-turkey-keeper-the-same-as-the-person-applying-for-the-cph-number | 5707 |  |  |
| 256 | GkEtrU | First and last name of the turkey keeper | First and last name of the turkey keeper | TextField | /contact-details-for-the-turkey-keeper | 5729 |  |  |
| 257 | bXJelh | Email address of the turkey keeper | Email address of the turkey keeper | EmailAddressField | /contact-details-for-the-turkey-keeper | 5742 |  |  |
| 258 | iszBgU | Phone number of the turkey keeper | Phone number of the turkey keeper | TelephoneNumberField | /contact-details-for-the-turkey-keeper | 5755 |  |  |
| 259 | tPestE | Address of the turkey keeper | Address of the turkey keeper | UkAddressField | /contact-details-for-the-turkey-keeper | 5768 |  |  |
| 260 | reBRFu | How many turkeys do you keep? | How many turkeys do you keep? | NumberField | /how-many-turkeys-do-you-keep | 5791 |  |  |
| 261 | QCgEps | What will you mainly use the turkeys for? | Main use for keeping turkeys | RadiosField | /what-will-you-mainly-use-the-turkeys-for | 5815 |  |  |
| 262 | WigZWk | What will the turkeys mainly be used for? | What will the turkeys mainly be used for? | RadiosField | /what-will-the-turkeys-mainly-be-used-for | 5837 |  |  |
| 263 | jkSwsD | What is the primary business purpose for keeping turkeys for meat? | What is the primary business purpose for keeping turkeys for meat? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-turkeys-for-meat | 5858 |  |  |
| 264 | bdAzTc | What is the primary business purpose for keeping turkeys for egg laying? | What is the primary business purpose for keeping turkeys for egg laying? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-turkeys-for-egg-laying | 5879 |  |  |
| 265 | laRodf | What is the primary business purpose for keeping a backyard flock of turkeys? | What is the primary business purpose for keeping a backyard flock of turkeys? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-a-backyard-flock-of-turkeys | 5900 |  |  |
| 266 | FbLPMl | What is the primary business purpose for keeping turkeys for the production of other products? | What is the primary business purpose for keeping turkeys for the production of other products? | RadiosField | /what-is-the-primary-business-purpose-for-keeping-turkeys-for-the-production-of-other-products | 5921 |  |  |
| 267 | GlJjbe | What farm management system do you use to keep turkeys? | What farm management system do you use to keep turkeys? | RadiosField | /what-farm-management-system-do-you-use-to-keep-turkeys | 5942 |  |  |
| 268 | MHHwHs | Where are your turkeys housed? | Where are your turkeys housed? | RadiosField | /where-are-your-turkeys-housed | 5963 |  |  |
| 269 | RicyRY | When do you stock turkeys? | When do you stock turkeys? | CheckboxesField | /when-do-you-stock-turkeys | 5984 |  |  |
| 270 | jCFOFs | Do the turkeys have access to open air? | Do the turkeys have access to open air? | YesNoField | /do-the-turkeys-have-access-to-open-air | 6005 |  |  |
| 271 | qhzXHr | Are the contact details for the 'other' poultry keeper the same as the person applying for the CPH number? | Are the contact details for the 'other' poultry keeper the same as the person applying for the CPH number? | YesNoField | /are-the-contact-details-for-the-other-poultry-keeper-the-same-as-the-person-applying-for-the-cph-number | 6046 |  |  |
| 272 | bHhpPg | First and last name of the 'other' poultry keeper | First and last name of the 'other' poultry keeper | TextField | /contact-details-for-the-other-poultry-keeper | 6068 |  |  |
| 273 | Dpnyrv | Email address of the 'other' poultry keeper | Email address of the 'other' poultry keeper | EmailAddressField | /contact-details-for-the-other-poultry-keeper | 6081 |  |  |
| 274 | SPIMHN | Phone number of the 'other' poultry keeper | Phone number of the 'other' poultry keeper | TelephoneNumberField | /contact-details-for-the-other-poultry-keeper | 6094 |  |  |
| 275 | AJjphW | Address of the 'other' poultry keeper | Address of the 'other' poultry keeper | UkAddressField | /contact-details-for-the-other-poultry-keeper | 6107 |  |  |
| 276 | GWBXSQ | What other species of poultry do you keep? | What species of poultry do you keep? | MultilineTextField | /what-other-species-of-poultry-do-you-keep | 6130 |  |  |
| 277 | kUUTsV | How many of this species do you keep? | How many of this species do you keep? | NumberField | /how-many-of-this-species-do-you-keep | 6153 |  |  |
| 278 | aEbyEJ | Where do you keep the 'other' poultry? | Where do you keep the 'other' poultry? | RadiosField | /where-do-you-keep-the-other-poultry | 6176 |  |  |
| 279 | XxSoib | What farm management system do you use to keep 'other' poultry? | What farm management system do you use to keep 'other' poultry? | RadiosField | /what-farm-management-system-do-you-use-to-keep-other-poultry | 6197 |  |  |
| 280 | mZSvgp | When do you stock 'other' poultry? | When do you stock 'other' poultry? | CheckboxesField | /when-do-you-stock-other-poultry | 6218 |  |  |
| 281 | ikJZaU | Does the 'other' poultry have access to open air? | Does the 'other' poultry have access to open air? | YesNoField | /does-the-other-poultry-have-access-to-open-air | 6239 |  |  |
| 282 | ExjcQZ | Can wild birds access where you keep poultry? | Can wild birds access where you keep poultry? | YesNoField | /can-wild-birds-access-where-you-keep-poultry | 6260 |  |  |
| 283 | XrhRHL | What's your egg marketing inspectorate number or Defra ID production number? | What's your egg marketing inspectorate number or Defra ID production number? | TextField | /whats-your-egg-marketing-inspectorate-number-or-defra-id-production-number | 6283 |  |  |
| 284 | ZYRHEn | Do you own or operate a hatchery? | Do you own or operate a hatchery? | YesNoField | /do-you-own-or-operate-a-hatchery | 6304 |  |  |
| 285 | TTQnaU | Memorable date | Memorable date | DatePartsField | /security-for-your-account | 6332 |  |  |
| 286 | JEmnQb | Memorable event | Memorable event | TextField | /security-for-your-account | 6345 |  |  |
| 287 | DUrooj | Memorable town or city | Memorable town or city | TextField | /security-for-your-account | 6358 |  |  |
