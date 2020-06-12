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

trigger_options = {
    "ingest_covid_case_data": [
        "--trigger-resource", "c19-backend-covid-case-data",
        "--trigger-event", "google.storage.object.finalize",
    ],
    "calculate_rt" : [
        "--trigger-http",
    ]
}

subprocess.run([
    "gcloud",
    "functions",
    "deploy",
    cloud_fn_name,
    "--entry-point", "{}".format(args.function_name),
    "--runtime", "python37",
    *trigger_options[args.function_name],
    "--allow-unauthenticated",
    "--project", "c19-backend",
])
