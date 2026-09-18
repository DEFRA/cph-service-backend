import { afterAll, beforeAll, beforeEach, expect, test, vi } from 'vitest'
import { insertRawFormSubmission } from './rawFormSubmissions.js'

const collectionName = 'raw-form-submissions'
const referenceNumber = 'TEST-REF-001'
const formId = 'test-form-id'

function createBody(answer = 'first test value')
{
    return JSON.stringify({
        meta: {
            referenceNumber,
            formId
        },
        data: {
            main: {
                inventedAnswer: answer
            }
        }
    })
}

describe('#insertRawFormSubmission', () => {
    let server
    let collection

    beforeAll(async () => {
        // Dynamic import needed due to config being updated by vitest-mongodb
        const { createServer } = await import('#/server.js')

        server = await createServer()
        await server.initialize()
        collection = server.db.collection(collectionName)
    })

    beforeEach(async () => {
        await collection.deleteMany({})
    })

    afterAll(async () => {
        await server.stop({ timeout: 1000 })
    })

    test('Stores the complete original body', async () => {
        const body = createBody()

        await insertRawFormSubmission(server.db, body)

        const storedSubmission = await collection.findOne({ referenceNumber })

        expect(storedSubmission.referenceNumber).toBe(referenceNumber)
        expect(storedSubmission.formId).toBe(formId)
        expect(storedSubmission.receivedAt).toBeInstanceOf(Date)
        expect(storedSubmission.body).toBe(body)
  })

  test('Does not create or overwrite a record delivered twice', async () => {
        const firstBody = createBody('first test value')
        const secondBody = createBody('changed test value')

        await insertRawFormSubmission(server.db, firstBody)
        await insertRawFormSubmission(server.db, secondBody)

        const storedSubmissions = await collection
            .find({ referenceNumber })
            .toArray()

        expect(storedSubmissions).toHaveLength(1)
        expect(storedSubmissions[0].body).toBe(firstBody)
    })

  test('Rejects malformed JSON without storing it', async () => {
        expect(() => insertRawFormSubmission(server.db, '{invalid')).toThrow()

        expect(await collection.countDocuments()).toBe(0)
    })

    test('Rejects a submission without a reference number', async () => {
        const body = JSON.stringify({ meta: { formId }})

        expect(() => insertRawFormSubmission(server.db, body)).toThrow(
            'Form submission is missing meta.referenceNumber'
        )

        expect(await collection.countDocuments()).toBe(0)
    })

    test('Propagates a MongoDB failure', async () => {
        const databaseError = new Error('Database unavailable')
        const updateOne = vi.fn().mockRejectedValue(databaseError)
        const db = {
            collection: vi.fn().mockReturnValue({ updateOne })
        }

        await expect(
            insertRawFormSubmission(db, createBody())
        ).rejects.toThrow('Database unavailable')
    })
})
