# connect-integration-smg-agenttrack
## Amazon Connect integration for VoiceFoundry Post-Call Surveys powered by SMG AgentTrack

The *VoiceFoundry Post-call Surveys powered by SMG AgentTrack* integration enables contact centers to easily implement and manage post-call surveys and submit them to Service Management Group (SMG) for aggregation, reporting, and center analysis.

![Architecture for VoiceFoundry Post-Call Surveys with AgentTrack integration](https://d0.awsstatic.com/partner-network/QuickStart/connect/connect-integration-voicefoundry-smg-agenttrack-architecture.png)

This integration deploys two AWS Lambda functions. The first Lambda function is wired to a contact flow in your Amazon Connect instance. When a customer completes a post-call survey, an Amazon Kinesis Data Firehose delivery stream feeds the call records in near real time to an Amazon Simple Storage Service (Amazon S3) bucket. The second Lambda function is triggered by the call record landing in the S3 bucket. It sends your survey results to SMG, where you can see reports, statistics, and key information from your surveys.

With VoiceFoundry Post-Call Surveys powered by SMG AgentTrack, the survey questions are managed from a very simple web UI on the AgentTrack website. There’s no need to alter call flows to change your survey, and no technical knowledge required to maintain surveys.

For details and launch information, see the [data sheet](https://fwd.aws/DJ49V).

To post feedback, submit feature ideas, or report bugs, use the **Issues** section of this GitHub repo.

