#!/usr/bin/env node

/**
 * DEMO DATA SEED SCRIPT
 *
 * ⚠️  WARNING: This script is for DEVELOPMENT / DEMO purposes ONLY.
 * It must NEVER be run against a production database.
 *
 * Usage:
 *   npm run demo:seed          (development only)
 *
 * The script is intentionally blocked when NODE_ENV=production.
 */

const { PrismaClient } = require('@prisma/client')

// ── Production guard ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  console.error('❌  BLOCKED: demo:seed must not be run in production.')
  console.error('    Set NODE_ENV to "development" or "test" to use this script.')
  process.exit(1)
}

const prisma = new PrismaClient()

async function seedDemoData() {
  console.log('🌱 Seeding demo data for IoT Parts Management System...')

  try {
    // Create demo users
    const demoUsers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'demo.student@sies.edu' },
        update: {},
        create: {
          email: 'demo.student@sies.edu',
          name: 'Demo Student',
          role: 'STUDENT',
          department: 'Computer Engineering',
          prn: 'PRN2024001',
          isActive: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'lab.assistant@sies.edu' },
        update: {},
        create: {
          email: 'lab.assistant@sies.edu',
          name: 'Lab Assistant',
          role: 'LAB_ASSISTANT',
          department: 'Computer Engineering',
          isActive: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'hod@sies.edu' },
        update: {},
        create: {
          email: 'hod@sies.edu',
          name: 'Head of Department',
          role: 'HOD',
          department: 'Computer Engineering',
          isActive: true,
        },
      }),
    ])

    console.log('✅ Created demo users')

    // Create demo components
    const demoComponents = await Promise.all([
      // Microcontrollers
      prisma.component.upsert({
        where: { serialNumber: 'ARD-UNO-001' },
        update: {},
        create: {
          serialNumber: 'ARD-UNO-001',
          qrCode: 'QR-ARD-UNO-001',
          name: 'Arduino Uno R3',
          description: 'Microcontroller board based on the ATmega328P',
          category: 'MICROCONTROLLER',
          manufacturer: 'Arduino',
          specifications: JSON.stringify({
            voltage: '5V',
            digitalPins: 14,
            analogPins: 6,
            flashMemory: '32KB',
          }),
          totalStock: 50,
          availableStock: 35,
          storageLocation: 'Shelf A1',
          cost: 25.99,
          isActive: true,
        },
      }),
      prisma.component.upsert({
        where: { serialNumber: 'ESP32-DEV-001' },
        update: {},
        create: {
          serialNumber: 'ESP32-DEV-001',
          qrCode: 'QR-ESP32-DEV-001',
          name: 'ESP32 DevKit',
          description: 'WiFi and Bluetooth enabled microcontroller',
          category: 'MICROCONTROLLER',
          manufacturer: 'Espressif Systems',
          specifications: JSON.stringify({
            processor: 'Dual-core Tensilica LX6',
            wifi: '802.11 b/g/n',
            bluetooth: 'v4.2 BR/EDR and BLE',
            gpio: 30,
          }),
          totalStock: 30,
          availableStock: 22,
          storageLocation: 'Shelf A2',
          cost: 12.50,
          isActive: true,
        },
      }),
      prisma.component.upsert({
        where: { serialNumber: 'NANO-001' },
        update: {},
        create: {
          serialNumber: 'NANO-001',
          qrCode: 'QR-NANO-001',
          name: 'Arduino Nano',
          description: 'Compact Arduino board with USB connectivity',
          category: 'MICROCONTROLLER',
          manufacturer: 'Arduino',
          specifications: JSON.stringify({
            voltage: '5V',
            digitalPins: 14,
            analogPins: 8,
            size: '18x45mm',
          }),
          totalStock: 40,
          availableStock: 28,
          storageLocation: 'Shelf A3',
          cost: 18.99,
          isActive: true,
        },
      }),

      // Single Board Computers
      prisma.component.upsert({
        where: { serialNumber: 'RPI-4B-001' },
        update: {},
        create: {
          serialNumber: 'RPI-4B-001',
          qrCode: 'QR-RPI-4B-001',
          name: 'Raspberry Pi 4 Model B',
          description: 'Single-board computer with ARM Cortex-A72 processor',
          category: 'MODULE',
          manufacturer: 'Raspberry Pi Foundation',
          specifications: JSON.stringify({
            ram: '4GB',
            processor: 'ARM Cortex-A72',
            connectivity: 'WiFi, Bluetooth, Ethernet',
            ports: 'USB 3.0, HDMI, GPIO',
          }),
          totalStock: 20,
          availableStock: 12,
          storageLocation: 'Shelf B2',
          cost: 75.00,
          isActive: true,
        },
      }),
      prisma.component.upsert({
        where: { serialNumber: 'RPI-ZERO-001' },
        update: {},
        create: {
          serialNumber: 'RPI-ZERO-001',
          qrCode: 'QR-RPI-ZERO-001',
          name: 'Raspberry Pi Zero W',
          description: 'Ultra-compact single-board computer with WiFi',
          category: 'MODULE',
          manufacturer: 'Raspberry Pi Foundation',
          specifications: JSON.stringify({
            ram: '512MB',
            processor: 'ARM11',
            connectivity: 'WiFi, Bluetooth',
            size: '65x30mm',
          }),
          totalStock: 25,
          availableStock: 18,
          storageLocation: 'Shelf B3',
          cost: 15.00,
          isActive: true,
        },
      }),

      // Sensors
      prisma.component.upsert({
        where: { serialNumber: 'HCSR04-001' },
        update: {},
        create: {
          serialNumber: 'HCSR04-001',
          qrCode: 'QR-HCSR04-001',
          name: 'Ultrasonic Sensor HC-SR04',
          description: 'Distance measuring sensor using ultrasonic waves',
          category: 'SENSOR',
          manufacturer: 'Generic',
          specifications: JSON.stringify({
            range: '2cm - 400cm',
            accuracy: '3mm',
            voltage: '5V DC',
            current: '15mA',
          }),
          totalStock: 100,
          availableStock: 85,
          storageLocation: 'Drawer C1',
          cost: 3.99,
          isActive: true,
        },
      }),
      prisma.component.upsert({
        where: { serialNumber: 'DHT22-001' },
        update: {},
        create: {
          serialNumber: 'DHT22-001',
          qrCode: 'QR-DHT22-001',
          name: 'DHT22 Temperature & Humidity Sensor',
          description: 'Digital temperature and humidity sensor',
          category: 'SENSOR',
          manufacturer: 'Aosong',
          specifications: JSON.stringify({
            temperature: '-40°C to 80°C',
            humidity: '0-100% RH',
            accuracy: '±0.5°C, ±1% RH',
            voltage: '3.3V-6V',
          }),
          totalStock: 60,
          availableStock: 45,
          storageLocation: 'Drawer C2',
          cost: 8.50,
          isActive: true,
        },
      }),
      prisma.component.upsert({
        where: { serialNumber: 'PIR-001' },
        update: {},
        create: {
          serialNumber: 'PIR-001',
          qrCode: 'QR-PIR-001',
          name: 'PIR Motion Sensor',
          description: 'Passive infrared motion detection sensor',
          category: 'SENSOR',
          manufacturer: 'Generic',
          specifications: JSON.stringify({
            range: '7 meters',
            angle: '110 degrees',
            voltage: '5V-20V',
            delay: '5-300 seconds',
          }),
          totalStock: 80,
          availableStock: 65,
          storageLocation: 'Drawer C3',
          cost: 4.99,
          isActive: true,
        },
      }),
      prisma.component.upsert({
        where: { serialNumber: 'LDR-001' },
        update: {},
        create: {
          serialNumber: 'LDR-001',
          qrCode: 'QR-LDR-001',
          name: 'Light Dependent Resistor (LDR)',
          description: 'Photoresistor for light intensity measurement',
          category: 'SENSOR',
          manufacturer: 'Generic',
          specifications: JSON.stringify({
            resistance: '1MΩ (dark) - 10kΩ (light)',
            voltage: '0-5V',
            response: 'Fast',
            size: '5mm',
          }),
          totalStock: 200,
          availableStock: 180,
          storageLocation: 'Drawer C4',
          cost: 1.50,
          isActive: true,
        },
      }),

      // Actuators & Motors
      prisma.component.upsert({
        where: { serialNumber: 'SG90-001' },
        update: {},
        create: {
          serialNumber: 'SG90-001',
          qrCode: 'QR-SG90-001',
          name: 'Servo Motor SG90',
          description: 'Micro servo motor for precise angular control',
          category: 'MODULE',
          manufacturer: 'TowerPro',
          specifications: JSON.stringify({
            torque: '1.8kg/cm',
            speed: '0.1s/60°',
            voltage: '4.8V - 6V',
            weight: '9g',
          }),
          totalStock: 75,
          availableStock: 60,
          storageLocation: 'Drawer D2',
          cost: 8.99,
          isActive: true,
        },
      }),
      prisma.component.upsert({
        where: { serialNumber: 'STEPPER-001' },
        update: {},
        create: {
          serialNumber: 'STEPPER-001',
          qrCode: 'QR-STEPPER-001',
          name: 'Stepper Motor 28BYJ-48',
          description: '5V stepper motor with ULN2003 driver',
          category: 'MODULE',
          manufacturer: 'Generic',
          specifications: JSON.stringify({
            voltage: '5V DC',
            steps: '2048 steps/revolution',
            torque: '34.3mN.m',
            frequency: '100Hz',
          }),
          totalStock: 40,
          availableStock: 32,
          storageLocation: 'Drawer D3',
          cost: 12.99,
          isActive: true,
        },
      }),

      // Display & LEDs
      prisma.component.upsert({
        where: { serialNumber: 'WS2812B-001' },
        update: {},
        create: {
          serialNumber: 'WS2812B-001',
          qrCode: 'QR-WS2812B-001',
          name: 'LED Strip WS2812B',
          description: 'Addressable RGB LED strip with integrated driver',
          category: 'MODULE',
          manufacturer: 'Adafruit',
          specifications: JSON.stringify({
            leds: '60 LEDs/meter',
            voltage: '5V DC',
            power: '18W/meter',
            protocol: 'WS2812B',
          }),
          totalStock: 25,
          availableStock: 18,
          storageLocation: 'Shelf E1',
          cost: 24.99,
          isActive: true,
        },
      }),
      prisma.component.upsert({
        where: { serialNumber: 'LCD-001' },
        update: {},
        create: {
          serialNumber: 'LCD-001',
          qrCode: 'QR-LCD-001',
          name: '16x2 LCD Display',
          description: 'Character LCD display with I2C backpack',
          category: 'MODULE',
          manufacturer: 'Generic',
          specifications: JSON.stringify({
            size: '16x2 characters',
            interface: 'I2C',
            voltage: '5V',
            backlight: 'Blue with white text',
          }),
          totalStock: 35,
          availableStock: 28,
          storageLocation: 'Shelf E2',
          cost: 15.99,
          isActive: true,
        },
      }),
      prisma.component.upsert({
        where: { serialNumber: 'OLED-001' },
        update: {},
        create: {
          serialNumber: 'OLED-001',
          qrCode: 'QR-OLED-001',
          name: '0.96" OLED Display',
          description: 'Small OLED display with SSD1306 controller',
          category: 'MODULE',
          manufacturer: 'Generic',
          specifications: JSON.stringify({
            size: '0.96 inch',
            resolution: '128x64',
            interface: 'I2C/SPI',
            colors: 'Monochrome',
          }),
          totalStock: 30,
          availableStock: 24,
          storageLocation: 'Shelf E3',
          cost: 12.50,
          isActive: true,
        },
      }),

      // Communication Modules
      prisma.component.upsert({
        where: { serialNumber: 'ESP8266-001' },
        update: {},
        create: {
          serialNumber: 'ESP8266-001',
          qrCode: 'QR-ESP8266-001',
          name: 'ESP8266 WiFi Module',
          description: 'WiFi module for IoT connectivity',
          category: 'MODULE',
          manufacturer: 'Espressif',
          specifications: JSON.stringify({
            wifi: '802.11 b/g/n',
            voltage: '3.3V',
            current: '80mA',
            range: '100m',
          }),
          totalStock: 45,
          availableStock: 38,
          storageLocation: 'Shelf F1',
          cost: 6.99,
          isActive: true,
        },
      }),
      prisma.component.upsert({
        where: { serialNumber: 'BLUETOOTH-001' },
        update: {},
        create: {
          serialNumber: 'BLUETOOTH-001',
          qrCode: 'QR-BLUETOOTH-001',
          name: 'HC-05 Bluetooth Module',
          description: 'Bluetooth serial communication module',
          category: 'MODULE',
          manufacturer: 'Generic',
          specifications: JSON.stringify({
            bluetooth: 'v2.0+EDR',
            range: '10 meters',
            voltage: '3.3V-6V',
            baud: '9600-1382400',
          }),
          totalStock: 50,
          availableStock: 42,
          storageLocation: 'Shelf F2',
          cost: 9.99,
          isActive: true,
        },
      }),

      // Power & Batteries
      prisma.component.upsert({
        where: { serialNumber: 'BATTERY-001' },
        update: {},
        create: {
          serialNumber: 'BATTERY-001',
          qrCode: 'QR-BATTERY-001',
          name: '9V Battery Holder',
          description: 'Battery holder for 9V batteries with leads',
          category: 'MODULE',
          manufacturer: 'Generic',
          specifications: JSON.stringify({
            voltage: '9V',
            connector: 'Snap connector',
            leads: '15cm wire leads',
            material: 'ABS plastic',
          }),
          totalStock: 100,
          availableStock: 85,
          storageLocation: 'Drawer G1',
          cost: 2.50,
          isActive: true,
        },
      }),
      prisma.component.upsert({
        where: { serialNumber: 'BREADBOARD-001' },
        update: {},
        create: {
          serialNumber: 'BREADBOARD-001',
          qrCode: 'QR-BREADBOARD-001',
          name: 'Half-Size Breadboard',
          description: 'Solderless breadboard for prototyping',
          category: 'BREADBOARD',
          manufacturer: 'Generic',
          specifications: JSON.stringify({
            size: '400 tie points',
            dimensions: '82x55mm',
            material: 'ABS + metal',
            color: 'White',
          }),
          totalStock: 80,
          availableStock: 65,
          storageLocation: 'Shelf H1',
          cost: 5.99,
          isActive: true,
        },
      }),

      // Resistors & Capacitors
      prisma.component.upsert({
        where: { serialNumber: 'RESISTOR-KIT-001' },
        update: {},
        create: {
          serialNumber: 'RESISTOR-KIT-001',
          qrCode: 'QR-RESISTOR-KIT-001',
          name: 'Resistor Kit (1/4W)',
          description: 'Assorted resistor kit with common values',
          category: 'RESISTOR',
          manufacturer: 'Generic',
          specifications: JSON.stringify({
            power: '1/4 Watt',
            tolerance: '5%',
            values: '1Ω to 10MΩ',
            quantity: '600 pieces',
          }),
          totalStock: 20,
          availableStock: 15,
          storageLocation: 'Drawer I1',
          cost: 19.99,
          isActive: true,
        },
      }),
      prisma.component.upsert({
        where: { serialNumber: 'CAPACITOR-KIT-001' },
        update: {},
        create: {
          serialNumber: 'CAPACITOR-KIT-001',
          qrCode: 'QR-CAPACITOR-KIT-001',
          name: 'Ceramic Capacitor Kit',
          description: 'Assorted ceramic capacitors',
          category: 'CAPACITOR',
          manufacturer: 'Generic',
          specifications: JSON.stringify({
            type: 'Ceramic',
            voltage: '50V',
            values: '10pF to 100nF',
            quantity: '300 pieces',
          }),
          totalStock: 15,
          availableStock: 12,
          storageLocation: 'Drawer I2',
          cost: 14.99,
          isActive: true,
        },
      }),
    ])

    console.log('✅ Created demo components')

    // Create demo requests
    const student = demoUsers[0]
    const labAssistant = demoUsers[1]
    const hod = demoUsers[2]
    const components = demoComponents

    const demoRequests = await Promise.all([
      // Pending requests
      prisma.componentRequest.create({
        data: {
          studentId: student.id,
          componentId: components[0].id, // Arduino Uno
          quantity: 2,
          purpose: 'IoT project for smart home automation system',
          expectedDuration: 14,
          status: 'PENDING',
        },
      }),
      prisma.componentRequest.create({
        data: {
          studentId: student.id,
          componentId: components[6].id, // DHT22 Sensor
          quantity: 1,
          purpose: 'Temperature monitoring for greenhouse project',
          expectedDuration: 21,
          status: 'PENDING',
        },
      }),
      prisma.componentRequest.create({
        data: {
          studentId: student.id,
          componentId: components[12].id, // LCD Display
          quantity: 1,
          purpose: 'Display interface for weather station',
          expectedDuration: 10,
          status: 'PENDING',
        },
      }),

      // Approved requests
      prisma.componentRequest.create({
        data: {
          studentId: student.id,
          componentId: components[5].id, // Ultrasonic Sensor
          quantity: 3,
          purpose: 'Distance measurement for robotics project',
          expectedDuration: 10,
          status: 'APPROVED',
          approvedBy: hod.id,
          approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
      }),
      prisma.componentRequest.create({
        data: {
          studentId: student.id,
          componentId: components[8].id, // PIR Sensor
          quantity: 2,
          purpose: 'Motion detection for security system',
          expectedDuration: 15,
          status: 'APPROVED',
          approvedBy: hod.id,
          approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
      }),

      // Issued requests
      prisma.componentRequest.create({
        data: {
          studentId: student.id,
          componentId: components[10].id, // Servo Motor
          quantity: 1,
          purpose: 'Mechanical control for final year project',
          expectedDuration: 21,
          status: 'ISSUED',
          approvedBy: hod.id,
          approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        },
      }),
      prisma.componentRequest.create({
        data: {
          studentId: student.id,
          componentId: components[17].id, // Breadboard
          quantity: 2,
          purpose: 'Prototyping circuits for embedded systems lab',
          expectedDuration: 30,
          status: 'ISSUED',
          approvedBy: hod.id,
          approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
      }),

      // Returned requests
      prisma.componentRequest.create({
        data: {
          studentId: student.id,
          componentId: components[15].id, // ESP8266
          quantity: 1,
          purpose: 'WiFi connectivity for IoT sensor network',
          expectedDuration: 14,
          status: 'RETURNED',
          approvedBy: hod.id,
          approvedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        },
      }),

      // Rejected request
      prisma.componentRequest.create({
        data: {
          studentId: student.id,
          componentId: components[3].id, // Raspberry Pi 4
          quantity: 5,
          purpose: 'Personal project',
          expectedDuration: 60,
          status: 'REJECTED',
          rejectionReason: 'Insufficient justification for personal use and excessive quantity requested',
        },
      }),
    ])

    console.log('✅ Created demo requests')

    // Create issued components for testing "Parts Issued" functionality
    const issuedComponents = await Promise.all([
      prisma.issuedComponent.create({
        data: {
          requestId: demoRequests[5].id, // Servo Motor request
          studentId: student.id,
          componentId: components[10].id, // Servo Motor
          quantity: 1,
          issuedBy: labAssistant.id,
          issuedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          expectedReturnDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000), // 11 days from now
          conditionOnIssue: 'NEW',
          notes: 'Handle with care, check torque specifications',
        },
      }),
      prisma.issuedComponent.create({
        data: {
          requestId: demoRequests[6].id, // Breadboard request
          studentId: student.id,
          componentId: components[17].id, // Breadboard
          quantity: 2,
          issuedBy: labAssistant.id,
          issuedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          expectedReturnDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
          conditionOnIssue: 'GOOD',
          notes: 'Clean breadboards, all tie points working',
        },
      }),
      // Add an overdue item for testing
      prisma.issuedComponent.create({
        data: {
          requestId: demoRequests[7].id, // ESP8266 request (returned)
          studentId: student.id,
          componentId: components[15].id, // ESP8266
          quantity: 1,
          issuedBy: labAssistant.id,
          issuedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
          expectedReturnDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago (overdue)
          actualReturnDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // returned 1 day ago
          returnedQuantity: 1,
          conditionOnIssue: 'GOOD',
          conditionOnReturn: 'GOOD',
          isReturned: true,
          notes: 'Returned in good condition, tested WiFi functionality',
        },
      }),
    ])

    console.log('✅ Created issued components')

    // Create audit logs
    await Promise.all([
      prisma.auditLog.create({
        data: {
          userId: student.id,
          action: 'CREATE_REQUEST',
          resource: 'REQUEST',
          details: JSON.stringify({ 
            resourceId: demoRequests[0].id,
            componentName: 'Arduino Uno R3', 
            quantity: 2 
          }),
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: demoUsers[2].id, // HOD
          action: 'APPROVE_REQUEST',
          resource: 'REQUEST',
          details: JSON.stringify({ 
            resourceId: demoRequests[1].id,
            componentName: 'Ultrasonic Sensor HC-SR04', 
            quantity: 3 
          }),
        },
      }),
    ])

    console.log('✅ Created audit logs')

    console.log('\n🎉 Demo data seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`   👥 Users: ${demoUsers.length}`)
    console.log(`   📦 Components: ${demoComponents.length}`)
    console.log(`   📋 Requests: ${demoRequests.length}`)
    console.log(`   🔄 Issued Items: ${issuedComponents.length}`)
    console.log('\n🎯 Component Categories:')
    console.log('   🔌 Microcontrollers: Arduino Uno, ESP32, Arduino Nano')
    console.log('   💻 Single Board Computers: Raspberry Pi 4, Pi Zero W')
    console.log('   📡 Sensors: Ultrasonic, DHT22, PIR, LDR')
    console.log('   ⚙️  Motors: Servo SG90, Stepper Motor')
    console.log('   📺 Displays: LED Strip, LCD 16x2, OLED')
    console.log('   📶 Communication: ESP8266, Bluetooth HC-05')
    console.log('   🔋 Power & Components: Battery Holders, Breadboards, Resistors, Capacitors')
    console.log('\n🚀 You can now test all functions:')
    console.log('   🌐 Visit: http://localhost:3000')
    console.log('   📋 Browse inventory with 20+ components')
    console.log('   📝 Create requests for any available component')
    console.log('   👀 View pending, approved, and issued requests')
    console.log('   📦 Check issued parts with return dates')
    console.log('   🔍 Test search and filtering functions')
    console.log('   📊 Explore different user role dashboards')

  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedDemoData().catch((error) => {
  console.error(error)
  process.exit(1)
})