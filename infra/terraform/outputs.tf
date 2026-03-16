output "vpc_id" {
  value = aws_vpc.civicshield.id
}

output "app_security_group_id" {
  value = aws_security_group.app.id
}

output "database_security_group_id" {
  value = aws_security_group.database.id
}

output "audit_bucket_name" {
  value = aws_s3_bucket.audit.bucket
}
