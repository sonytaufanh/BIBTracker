import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding BIBTracker database...')

  await prisma.shareableLink.deleteMany()
  await prisma.bIBDetection.deleteMany()
  await prisma.photo.deleteMany()
  await prisma.checkpoint.deleteMany()
  await prisma.participant.deleteMany()
  await prisma.oCRScanJob.deleteMany()
  await prisma.ingestionLog.deleteMany()
  await prisma.exportJob.deleteMany()
  await prisma.userEvent.deleteMany()
  await prisma.apiKey.deleteMany()
  await prisma.user.deleteMany()
  await prisma.event.deleteMany()

  const admin = await prisma.user.create({
    data: {
      email: 'admin@bibtracker.io',
      name: 'Race Director',
      passwordHash: '$2a$10$placeholderhash',
      role: 'admin',
    },
  })

  const operator = await prisma.user.create({
    data: {
      email: 'operator@bibtracker.io',
      name: 'Race Marshall',
      passwordHash: '$2a$10$placeholderhash',
      role: 'operator',
    },
  })

  console.log(`Created users: ${admin.name}, ${operator.name}`)

  const event = await prisma.event.create({
    data: {
      name: 'City Marathon 2026',
      slug: 'city-marathon-2026',
      eventDate: new Date('2026-10-20T05:00:00Z'),
      status: 'active',
      location: 'Central Park, Jakarta',
      description: 'Annual city marathon with 10K, Half Marathon, and Full Marathon categories.',
      logoUrl: '/assets/logo-event.png',
      watermarkLogoUrl: '/assets/logo-event.png',
      watermarkEnabled: true,
      watermarkPosition: 'bottom_right',
      watermarkOpacity: 0.8,
      userEvents: {
        create: [
          { userId: admin.id },
          { userId: operator.id },
        ],
      },
    },
  })

  console.log(`Created event: ${event.name}`)

  const checkpoints = await Promise.all([
    prisma.checkpoint.create({
      data: {
        eventId: event.id,
        name: 'Start Line',
        sequence: 0,
        distanceKm: 0,
        cutoffTime: 360,
      },
    }),
    prisma.checkpoint.create({
      data: {
        eventId: event.id,
        name: 'Checkpoint 1 - 5K',
        sequence: 1,
        distanceKm: 5,
        cutoffTime: 45,
      },
    }),
    prisma.checkpoint.create({
      data: {
        eventId: event.id,
        name: 'Checkpoint 2 - 10K',
        sequence: 2,
        distanceKm: 10,
        cutoffTime: 90,
      },
    }),
    prisma.checkpoint.create({
      data: {
        eventId: event.id,
        name: 'Checkpoint 3 - 15K',
        sequence: 3,
        distanceKm: 15,
        cutoffTime: 135,
      },
    }),
    prisma.checkpoint.create({
      data: {
        eventId: event.id,
        name: 'Finish Line',
        sequence: 4,
        distanceKm: 21.1,
        cutoffTime: 210,
      },
    }),
  ])

  console.log(`Created ${checkpoints.length} checkpoints`)

  const participantData = [
    { bib: '1001', name: 'Ahmad Rizki', gender: 'M', category: 'Full Marathon', team: 'Jakarta Runners' },
    { bib: '1002', name: 'Siti Nurhaliza', gender: 'F', category: 'Half Marathon', team: 'Bandung Pacers' },
    { bib: '1003', name: 'Budi Santoso', gender: 'M', category: '10K', team: null },
    { bib: '1004', name: 'Dewi Lestari', gender: 'F', category: 'Half Marathon', team: 'Jakarta Runners' },
    { bib: '1005', name: 'Eko Prasetyo', gender: 'M', category: 'Full Marathon', team: 'Surabaya Striders' },
    { bib: '1006', name: 'Fitri Handayani', gender: 'F', category: '10K', team: null },
    { bib: '1007', name: 'Galih Wijaya', gender: 'M', category: 'Half Marathon', team: 'Bandung Pacers' },
    { bib: '1008', name: 'Hana Permata', gender: 'F', category: 'Full Marathon', team: 'Jakarta Runners' },
    { bib: '1009', name: 'Indra Kusuma', gender: 'M', category: '10K', team: 'Surabaya Striders' },
    { bib: '1010', name: 'Juli Safitri', gender: 'F', category: 'Half Marathon', team: null },
  ]

  const participants = await Promise.all(
    participantData.map((p) =>
      prisma.participant.create({
        data: {
          eventId: event.id,
          bibNumber: p.bib,
          fullName: p.name,
          gender: p.gender,
          category: p.category,
          team: p.team,
        },
      }),
    ),
  )

  console.log(`Created ${participants.length} participants`)

  const photoData = [
    { filename: 'RACETORCH_001.jpg', checkpointIdx: 0, hour: 5, min: 2, bibs: [{ bib: '1001', conf: 0.95 }, { bib: '1002', conf: 0.88 }] },
    { filename: 'RACETORCH_002.jpg', checkpointIdx: 0, hour: 5, min: 3, bibs: [{ bib: '1003', conf: 0.92 }] },
    { filename: 'RACETORCH_003.jpg', checkpointIdx: 0, hour: 5, min: 4, bibs: [{ bib: '1004', conf: 0.45 }, { bib: '1005', conf: 0.91 }] },
    { filename: 'RACETORCH_004.jpg', checkpointIdx: 1, hour: 5, min: 35, bibs: [{ bib: '1001', conf: 0.93 }] },
    { filename: 'RACETORCH_005.jpg', checkpointIdx: 1, hour: 5, min: 38, bibs: [{ bib: '1002', conf: 0.87 }, { bib: '1007', conf: 0.55 }] },
    { filename: 'RACETORCH_006.jpg', checkpointIdx: 1, hour: 5, min: 42, bibs: [{ bib: '1003', conf: 0.96 }] },
    { filename: 'RACETORCH_007.jpg', checkpointIdx: 2, hour: 6, min: 25, bibs: [{ bib: '1001', conf: 0.94 }, { bib: '1008', conf: 0.89 }] },
    { filename: 'RACETORCH_008.jpg', checkpointIdx: 2, hour: 6, min: 28, bibs: [{ bib: '1005', conf: 0.38 }] },
    { filename: 'RACETORCH_009.jpg', checkpointIdx: 2, hour: 6, min: 30, bibs: [{ bib: '1004', conf: 0.91 }] },
    { filename: 'RACETORCH_010.jpg', checkpointIdx: 3, hour: 7, min: 10, bibs: [{ bib: '1001', conf: 0.97 }] },
    { filename: 'RACETORCH_011.jpg', checkpointIdx: 3, hour: 7, min: 15, bibs: [{ bib: '1008', conf: 0.85 }] },
    { filename: 'RACETORCH_012.jpg', checkpointIdx: 4, hour: 8, min: 5, bibs: [{ bib: '1001', conf: 0.98 }] },
    { filename: 'RACETORCH_013.jpg', checkpointIdx: 4, hour: 8, min: 20, bibs: [{ bib: '1002', conf: 0.90 }] },
    { filename: 'RACETORCH_014.jpg', checkpointIdx: 4, hour: 8, min: 35, bibs: [] },
    { filename: 'RACETORCH_015.jpg', checkpointIdx: 4, hour: 8, min: 40, bibs: [{ bib: '1006', conf: 0.52 }] },
  ]

  const photos = await Promise.all(
    photoData.map((pd) => {
      const cp = checkpoints[pd.checkpointIdx]
      const ts = new Date(`2026-10-20T${String(pd.hour).padStart(2, '0')}:${String(pd.min).padStart(2, '0')}:00Z`)
      return prisma.photo.create({
        data: {
          eventId: event.id,
          checkpointId: cp.id,
          filename: pd.filename,
          sourcePath: `/gdrive/bibtracker/${event.slug}/${pd.filename}`,
          thumbnailUrl: `https://placehold.co/400x300/3b82f6/white?text=${pd.filename}`,
          fullUrl: `https://placehold.co/1920x1440/3b82f6/white?text=${pd.filename}`,
          storageAdapter: 'gdrive',
          fileSize: Math.floor(Math.random() * 5000000) + 1000000,
          width: 1920,
          height: 1440,
          exifTimestamp: ts,
          detectedAt: ts,
          processingStatus: 'indexed',
          checksum: `hash_${pd.filename}`,
          detections: {
            create: pd.bibs.map((b) => {
              const participant = participants.find((p) => p.bibNumber === b.bib)
              const status = b.conf >= 0.7 ? 'verified' : 'unverified'
              return {
                bibNumber: b.bib,
                confidenceScore: b.conf,
                status,
                ocrEngine: 'local',
                detectedAt: ts,
                verifiedAt: status === 'verified' ? ts : null,
                verifiedById: status === 'verified' ? admin.id : null,
                participantId: participant?.id ?? null,
                bboxX: Math.random() * 500,
                bboxY: Math.random() * 500,
                bboxWidth: 150 + Math.random() * 100,
                bboxHeight: 80 + Math.random() * 50,
              }
            }),
          },
        },
      })
    }),
  )

  console.log(`Created ${photos.length} photos with detections`)

  const scanJob = await prisma.oCRScanJob.create({
    data: {
      eventId: event.id,
      engine: 'local',
      status: 'completed',
      totalPhotos: photos.length,
      processedPhotos: photos.length,
      detectedBibs: photoData.reduce((acc, p) => acc + p.bibs.length, 0),
      startedAt: new Date('2026-10-20T05:05:00Z'),
      completedAt: new Date('2026-10-20T05:15:00Z'),
    },
  })

  console.log(`Created OCR scan job: ${scanJob.id}`)

  const ingestionLog = await prisma.ingestionLog.create({
    data: {
      eventId: event.id,
      adapter: 'gdrive',
      status: 'completed',
      filesFound: photos.length,
      filesSynced: photos.length,
      filesSkipped: 0,
      filesFailed: 0,
      startedAt: new Date('2026-10-20T04:50:00Z'),
      completedAt: new Date('2026-10-20T04:55:00Z'),
    },
  })

  console.log(`Created ingestion log: ${ingestionLog.id}`)

  await prisma.shareableLink.create({
    data: {
      token: 'demo-share-1001',
      bibNumber: '1001',
      eventId: event.id,
      viewCount: 0,
    },
  })

  console.log('Seed completed successfully!')
  console.log('\n--- Summary ---')
  console.log(`Users: 2`)
  console.log(`Events: 1`)
  console.log(`Checkpoints: ${checkpoints.length}`)
  console.log(`Participants: ${participants.length}`)
  console.log(`Photos: ${photos.length}`)
  console.log(`Detections: ${photoData.reduce((acc, p) => acc + p.bibs.length, 0)}`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
