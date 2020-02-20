[![Total alerts](https://img.shields.io/lgtm/alerts/g/harveyr/gh-action-bandit.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/harveyr/gh-action-bandit/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/harveyr/gh-action-bandit.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/harveyr/gh-action-bandit/context:javascript)

# gh-action-bandit

A GitHub action to report [Bandit](https://pypi.org/project/bandit/) issues into
GitHub check runs with annotations.

The goal is to report line-level annotations whose severity level is based on
the severity and confidence levels that Bandit reports. For example:

![Image description](docs/images/annotations-example.png)
