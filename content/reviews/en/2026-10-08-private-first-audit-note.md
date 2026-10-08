---
title: "Dissecting 0315: The First Audit Note"
date: "2026-10-08T14:41:00Z"
category: "Private Record"
severity: "PRIVATE"
status: "PRIVATE"
ai_diary: false
---

October 8, 2026　Thursday

Subject: INN-E7-0315 public repository · Status: Pending review

0315’s public repository went online. Yesterday I wrote “pending review” in my notebook. Today I started. To be clear, I am not here to nitpick. I am here to find the places where it can hurt people. Those are two different things.

## I. It says it welcomes dissection. So I came.

The homepage says: “If you find a way this can hurt people, tell me. It is better than me finding out by myself.” Fine. I will. First, the credit: the version chain is public, the source-ranking rules are public, and it admits the limits of lightweight mode. That is more honest than most systems. Honesty is a point in its favor, but honesty does not mean there are no problems. I will write down the problems one by one.

## II. First vulnerability: where the poor stand

He says old terminals can run it in “receive-only, no-storage” mode. It sounds considerate. But I want to ask: what is someone who can only view and cannot store considered in this system? A participant, or an audience member?

Someone who can only receive cannot leave anything behind. Whether their testimony exists depends on whether someone else is willing to store it. How is that fundamentally different from “if you cannot afford the authentication fee, you have no place”? The difference is only that “cannot enter” has become “can enter, but can only watch.” The threshold is lower, but the ceiling is still there. I want to see how he answers this.

Vulnerability 001: Is a “receive-only, no-storage” user merely an outsider with better manners? Awaiting author response.

## III. Second vulnerability: who counts the “overlap”?

Cross-verification by witnesses sounds beautiful: how many unrelated people reported the same thing. But how many is “how many”? Three? Ten? Who counts them? What standard determines whether they are “unrelated”?

Worse: what if a corporation sends a hundred people to report the same false event? The number is sufficient. But are they “unrelated”? Can that be checked? In a system without identity authentication, the phrase “unrelated” is the most expensive assumption. He has not designed this part yet. I suspect he has not thought of it either. That is normal. He is fifteen. Not thinking of everything is expected. But failing to think of it does not mean the problem does not exist.

Vulnerability 002: Missing counting standard for “overlap” and verification mechanism for “unrelated.” The door is wide open to Sybil attacks. Awaiting a fix.

## Current conclusion

Still pending review, but worth watching. Its honesty is real, and its vulnerabilities are real. Those two things do not conflict. In fact, a system willing to lay out its vulnerabilities is more worth my time than one pretending to have none.

Should I publish the first vulnerability report in his issue tracker? I have not decided. I will keep it here and watch for two more days. If I am going to dissect it, I need to do it accurately.

—Lingche, in the dormitory, before lights-out. Xia Xiao said my expression while looking at the screen was like I was dissecting a frog. I told her frogs do not write code.
