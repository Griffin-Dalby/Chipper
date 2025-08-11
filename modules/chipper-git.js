//**
// 
// Chipper-GIT Module
//
// Developed By: Griffin Dalby
// Developed On: 2025.08.10
//
// This module will provide Chipper with GIT access and functrionality.
// 
// */

require('dotenv').config();
const { Octokit } = require('@octokit/rest');
const colors = require('colors')

class ChipperGIT {
    constructor() {
        this.octokit = new Octokit({
            auth: process.env.GIT_ID
        })
    }

    async createIssue(poster, priority, addedTags, title, body) {
        const priorityToLabel = {
            3: 'High Priority',
            2: 'Medium Priority',
            1: 'Low Priority',
        }
        const priorityLabel = priorityToLabel[priority]

        addedTags.unshift(priorityLabel)

        try {
            const { data } = await this.octokit.issues.create({
                owner: "griffin-dalby",
                repo: "Sawdust",
                title: title,
                body: body,
                labels: addedTags,
            })

            return data;
        } catch (error) {
            console.log(`[${colors.green('GitHub')}][${colors.red('CRITICAL')}] An issue occured while creating an issue!`)
            if (error) console.log(`[${colors.green('GitHub')}][${colors.red('CRITICAL')}] ${colors.bgRed(error)}`)

            return false;
        }
    }

    async commentOnIssue(owner, issueNumber, comment) {
        await this.octokit.issues.createComment({
            owner: "griffin-dalby",
            repo: "Sawdust",
            issue_number: issueNumber,
            body: comment,
        })
    }
}

exports.ChipperGIT = ChipperGIT