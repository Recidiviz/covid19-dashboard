import argparse
import subprocess

parser = argparse.ArgumentParser(
    description="Deploy google cloud functions for COVID dashboard site")
parser.add_argument("function_name")
parser.add_argument("env", choices=("production", "development"))

args = parser.parse_args()

# distinguish dev and prod versions
cloud_fn_name = args.function_name
if args.env == "development":
    cloud_fn_name += "_development"

subprocess.run([
    "gcloud",
    "functions",
    "deploy",
    cloud_fn_name,
    "--entry-point", "{}".format(args.function_name),
    "--runtime", "python37",
    "--trigger-http",
    "--allow-unauthenticated",
    "--project", "c19-backend",
])
