📦 Staff Engineer Coding Interview Prompt – Warehouse Management System (GraphQL)

✉️ Overview
A Warehouse Management System (WMS) is software that helps track and manage everything
that happens inside a warehouse — like receiving packages, putting packages on a pallet,
staging pallets in the right storage locations, picking (retrieving) them when needed, loading
them on a truck etc. It ensures warehouse operations are organized, accurate, and efficient.
You are tasked with designing and implementing the foundational backend for a WMS using
GraphQL. The system should support the following warehouse operation:

● Induct: Receive and register incoming packages into the system.
● Stow: Place packages on a pallet
● Stage: Place pallets into a staging location
● Pick: Retrieve pallets from staging location

This interview is split into two parts:
● A take-home assignment, focused on induct logic and architecture.
● An in-person session, where you’ll extend your system to add additional functionality.

Note: We understand that parts of this take-home exercise may feel a bit vague, especially if
you're not very familiar with the supply chain and warehousing domain. To help, we're offering
the option to schedule a 15-minute call with the hiring manager to ask any clarifying questions. If
you'd like to take advantage of that, please let the recruiter know and come prepared with your
questions.

✅ Part 1: Take-Home Assignment – Implement Induct in GraphQL

Objective: Build a GraphQL API that allows warehouse operators to register newly arrived
packages into the system and place packages onto a pallet. You should define your own
GraphQL types and schema, but ensure the following behavior and data expectations are met.

📥 Induct Workflow – Mutation Expectations
Create a GraphQL mutation that enables clients to register one or more packages being
received into the warehouse.

Each package should include the following fields at the minimum:

● Received Timestamp – when the pallet was received.
● Package ID – uniquely identifies a package
● Receiving Warehouse ID - uniquely identifies the induct facility

Note: Clients send Veho package data in advance to inform us which packages they plan to
inject into our network. In the ideal scenario, those packages already exist in our database by
the time they’re inducted, so your system should only need to update their status. Feel free to
pre-seed your database with sample package data to reflect this flow.

📥 Stow Workflow
Enable stowing a package or list of packages to a pallet.
● Pallet ID – a unique identifier for the pallet.
● Stow Timestamp – when the pallet was received.
● Package IDs – a list of Package IDs, where each ID uniquely identifies a package on
the pallet.

🧠 Functional Expectations
● Make sure you have proper validation in place for Packages. Take a moment to think
through what kinds of checks you'd want to enforce, what assumptions should always
hold true, and what edge cases you might need to guard against.
● Store pallet and package data in a persistent or in-memory database.
● Associate packages with their parent pallet in the data model.
● Return a structured response indicating success or failure, along with a message
explaining the result (e.g., "inducted successfully").

⚙️ Non-Functional Expectations
● We prefer that you use TypeScript and Node.js. However, if you're not familiar with it,
you're welcome to use a different stack you're more comfortable with.
● Ensure your GraphQL schema, resolvers, and services are modular and testable.
● Include a README with:
○ Setup instructions
○ Example GraphQL queries/mutations
○ How to run your tests
● Implement automated unit tests for your core logic (validation, state handling, mutation
behavior).
At Veho, we encourage the use of LLMs. You’re welcome to use them for this take-home
exercise if you choose to—just make sure you fully understand the code and are able to explain,
debug, and extend it during the onsite round.

🧭 Architecture Deliverable
Provide an architecture diagram (PDF/image) that illustrates data flow and system
components for:
● Induct (the action of registering newly arrived packages into the system)
● Stow (the action of placing received packages onto a pallet)
● Stage (the action of placing pallets into a warehouse storage location)
● Pick (the action of retrieving a pallet from its storage location)
Diagram expectations:
● GraphQL server
● Resolvers, services, and data access layers
● Data model relationships (pallets, packages, storage locations)
● Future enhancements
● State transitions: INDUCTED → STOWED → STAGED → PICKED
Note: You do not need to write code for Stage and Pick operations.

📄 Submission Instructions
● Submit your code via GitHub
● Include:
○ Complete GraphQL API for induct and stow
○ Architecture diagram
○ Setup guide and usage in README
○ Tests (unit/integration)
