# connect-integration-smg-agenttrack

## VoiceFoundry Post-call Surveys powered by SMG AgentTrack integration with Amazon Connect

This integration enables the SaaS AWS Marketplace listing entitled *VoiceFoundry Post-call Surveys powered by SMG AgentTrack*, which allows Contact Centers to easily implement and manage post-call surveys that are submitted to SMG for aggregation, reporting, and center analysis. The integration deploys two Lambda functions and sets up a trigger for when your Amazon Connect contact trace records are added to a specified S3 bucket.

![Architecture for SMG AgentTrack integration](https://d0.awsstatic.com/partner-network/QuickStart/connect/connect-integration-smg-agenttrack-architecture.png)

*VoiceFoundry Post-call Surveys powered by SMG AgentTrack* was developed in concert with SMG (Service Management Group), the leader in customer service management measurement. SMG combines technology and insights that keep you informed and advance your brand for the next level of customer and employee loyalty. SMG connects the links between employee engagement, customer satisfaction and financial performance. All surveys submitted through the application are provided to SMG to give you advanced insight to your agent’s customer service performance and effectiveness.

The integration of *VoiceFoundry Post-call Surveys powered by SMG AgentTrack* with Amazon Connect provides a way for contact center managers to add post-call surveys into their call flows without having to update contact flows in order to change the surveys. After you have purchased VoiceFoundry Post-call Surveys powered by SMG AgentTrack from the AWS Marketplace, setup only requires you to add a single Lambda from this QuickStart to a contact flow in your Amazon Connect Instance. Once the call is complete, your existing Amazon Kinesis Data Stream feeds the call records in near real-time to your existing S3 bucket. The QuickStart’s second Lambda, which is triggered by the call record landing in your S3 bucket, sends over your survey results to SMG, where you can see reports, stats, and key information coming from your surveys.

The benefits of this integration include:

- Ease of Use: All of the components to enable *VoiceFoundry Post-call Surveys powered by SMG AgentTrack* for your Amazon Connect instance is installed with the click of a button.

- No technical knowledge to maintain surveys: With *VoiceFoundry Post-call Surveys powered by SMG AgentTrack*, the survey questions are managed from a very simple web UI. There’s no need to alter contact flows to change your survey. Browse to the AgentTrack website and update at-will. The very next survey will reflect your changes.

For details and launch information, see the [data sheet](https://voicefoundry.com/smg-agenttrack/).

To post feedback, submit feature ideas, or report bugs, use the **Issues** section of this GitHub repo.

