#!/usr/bin/env node
// import * as acm from "@aws-cdk/aws-certificatemanager";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/cdk";

class GrahamStack extends cdk.Stack {
    constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
        super(parent, name, props);

        // DNS validation is not currently available in CloudFormation.
        /* 
        const certificate = new acm.Certificate(this, `Certificate-${name}`, {
            domainName: "*.mochizuki.moe"
        });
        */

        // static site hosting is not currently available in CloudFormation, please configure it manually.
        const bucket = new s3.Bucket(this, `S3Bucket-${name}`, {
            bucketName: "static.mochizuki.moe",
        });

        const originId = new cloudfront.cloudformation.CloudFrontOriginAccessIdentityResource(this, `OriginAccessIdentity`, {
            cloudFrontOriginAccessIdentityConfig: {
                comment: "static.mochizuki.moe S3 access"
            },
        });

        new cloudfront.CloudFrontWebDistribution(this, `CloudFront-${name}`, {
            aliasConfiguration: {
                acmCertRef: "arn:aws:acm:us-east-1:123456789012:certificate/58d7ec39-e8d6-40c6-8697-5f6733be0b5b",
                names: ["static.mochizuki.moe"],
                sslMethod: cloudfront.SSLMethod.SNI,
                // vNext
                // securityPolicy: cloudfront.SecurityPolicyProtocol.TLSv1_2_2016,
            },
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: bucket,
                        // Need to set "Yes, Update Bucket Policy" at the CloudFront Console?
                        originAccessIdentity: originId,

                    },
                    behaviors: [
                        { isDefaultBehavior: true }
                    ]
                }
            ],
            priceClass: cloudfront.PriceClass.PriceClass200,
        });
    }
}

const app = new cdk.App(process.argv);

new GrahamStack(app, "GrahamStack");

process.stdout.write(app.run());
