# CD: AWS

Deploying released infrastructure/apps to AWS with Terraform.

Demonstrated in: [bitwise-devops-aws](https://github.com/barikpriyabrata27/bitwise-devops-aws)
— a series of small labs (VPC, security groups, EC2, IAM, S3, DynamoDB, RDS,
ALB/ASG, CloudWatch, and more), each a self-contained root module.

Labs consume shared, reusable modules from
[bitwise-devops-terraform](https://github.com/barikpriyabrata27/bitwise-devops-terraform)
via a Git module source instead of duplicating Terraform code (see
[shared/terraform.md](../shared/terraform.md)):

```hcl
module "vpc" {
  source = "git::https://github.com/barikpriyabrata27/bitwise-devops-terraform.git//modules/aws/vpc?ref=main"
  # ...
}
```

Back to [CD overview](README.md).
