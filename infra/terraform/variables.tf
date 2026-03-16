variable "project_name" {
  type    = string
  default = "civicshield"
}

variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "allowed_ssh_cidr" {
  type    = string
  default = "0.0.0.0/0"
}
