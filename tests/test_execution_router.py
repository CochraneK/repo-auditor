import unittest

from scripts.execution_router import Task, route


class ExecutionRouterTests(unittest.TestCase):
    def test_bounded_task_prefers_chat(self):
        result = route(Task(scope=1, repo_execution=1, iteration_depth=0))
        self.assertEqual(result["recommended"], "CHAT")

    def test_repo_engineering_prefers_code(self):
        result = route(Task(scope=4, repo_execution=5, iteration_depth=5, verification_cost=4))
        self.assertEqual(result["recommended"], "CODE")

    def test_cross_system_autonomy_prefers_work(self):
        result = route(Task(scope=4, cross_system_dependency=5, autonomy_need=5, iteration_depth=3))
        self.assertEqual(result["recommended"], "WORK")

    def test_ambiguity_can_prepend_plan(self):
        result = route(Task(scope=4, ambiguity=5, repo_execution=5, iteration_depth=5, verification_cost=4))
        self.assertIn(result["recommended"], {"PLAN", "CODE"})
        if result["recommended"] == "CODE":
            self.assertEqual(result["route"][0], "PLAN")

    def test_recurring_prefers_watch(self):
        self.assertEqual(route(Task(recurring=True))["recommended"], "WATCH")

    def test_owner_choice_forces_human(self):
        self.assertEqual(route(Task(owner_choice=True))["recommended"], "HUMAN")

    def test_rejects_out_of_range_values(self):
        with self.assertRaises(ValueError):
            route(Task(scope=6))


if __name__ == "__main__":
    unittest.main()
