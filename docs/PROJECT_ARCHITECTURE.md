# Project Architecture

## Goal

Convert user feedback into GitHub Issues.

## Workflow

Visitor

↓

Feedback Widget

↓

Express Backend

↓

GitHub REST API

↓

GitHub Issue

## Components

### Widget
Responsible for displaying the feedback form.

### Backend
Receives requests and communicates with GitHub.

### Demo
Used for testing the widget locally.