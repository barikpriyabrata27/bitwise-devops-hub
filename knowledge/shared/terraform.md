# Shared: Terraform Modules

[bitwise-devops-terraform](https://github.com/barikpriyabrata27/bitwise-devops-terraform)
is not a CI or CD example itself — it's the shared module registry that the
[AWS](../cd/aws.md) and [GCP](../cd/gcp.md) deployment examples consume.

## Layout

```text
modules/
  aws/
    vpc/, security_group/, ec2_instance/, iam_basic/, s3_bucket/,
    dynamodb_table/, cloudwatch_log_group/
  gcp/
    network/
Learning_Doc/
  services/            per-service Terraform and cloud learning notes
```

## How consuming repos wire in

Root configurations in `bitwise-devops-aws` and `bitwise-devops-gcp`
reference a module with a Git source instead of a local relative path,
since the modules live in a separate repo:

```hcl
module "vpc" {
  source = "git::https://github.com/barikpriyabrata27/bitwise-devops-terraform.git//modules/aws/vpc?ref=main"

  name                = var.name
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  public_subnet_cidrs = var.public_subnet_cidrs
  common_tags         = var.common_tags
}
```

## Versioning

`?ref=main` tracks the latest module on `main`, which is fine for local
learning. Pin `?ref=` to a tag or commit SHA once a module is stable, so
consuming repos don't pick up breaking changes automatically.

## Related

- [AWS deployment](../cd/aws.md)
- [GCP deployment](../cd/gcp.md)
- [bitwise-devops-terraform README](https://github.com/barikpriyabrata27/bitwise-devops-terraform/blob/main/README.md)
